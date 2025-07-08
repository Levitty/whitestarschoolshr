
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export const useDocuments = () => {
  const { user, session } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      console.log('useDocuments - User authenticated, fetching documents');
      fetchDocuments();
    } else {
      console.log('useDocuments - No authenticated user');
      setDocuments([]);
      setLoading(false);
    }
  }, [user, session]);

  const fetchDocuments = async () => {
    if (!user || !session) {
      console.log('No authenticated user for fetching documents');
      return;
    }

    try {
      console.log('Fetching documents for user:', user.id);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
      } else {
        console.log('Fetched documents:', data?.length || 0);
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    title: string,
    description: string,
    category: Database['public']['Enums']['document_category'],
    employeeId?: string
  ) => {
    console.log('uploadDocument called with:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      title,
      category,
      employeeId,
      userId: user?.id,
      hasSession: !!session,
      hasAccessToken: !!session?.access_token
    });
    
    // Comprehensive authentication check
    if (!user || !session || !session.access_token) {
      console.error('Authentication failed - Missing:', {
        user: !user,
        session: !session,
        accessToken: !session?.access_token
      });
      return { 
        error: { 
          message: 'Authentication required. Please sign out and sign back in.' 
        } 
      };
    }

    // Validate session is still active
    try {
      const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionCheck.session || !sessionCheck.session.user) {
        console.error('Session validation failed:', sessionError);
        return { 
          error: { 
            message: 'Session expired. Please sign in again.' 
          } 
        };
      }
      console.log('Session validation passed');
    } catch (sessionError) {
      console.error('Session check failed:', sessionError);
      return { 
        error: { 
          message: 'Authentication verification failed. Please sign in again.' 
        } 
      };
    }

    try {
      // Upload file to storage with enhanced error handling
      const fileExt = file.name.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to storage:', { filePath, bucketName: 'employee-documents' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { 
          error: { 
            message: `File upload failed: ${uploadError.message}` 
          } 
        };
      }

      console.log('File uploaded successfully:', uploadData);

      // Create document record with comprehensive data
      const documentData: DocumentInsert = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        uploaded_by: user.id,
        employee_id: employeeId || null,
        status: 'draft',
        is_shared: false,
        requires_signature: false
      };

      console.log('Creating document record:', documentData);

      const { data: documentResult, error: documentError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (documentError) {
        console.error('Database insert error:', documentError);
        
        // Clean up uploaded file if database insert fails
        try {
          await supabase.storage
            .from('employee-documents')
            .remove([filePath]);
          console.log('Cleaned up uploaded file after database error');
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
        
        return { 
          error: { 
            message: `Document creation failed: ${documentError.message}` 
          } 
        };
      }

      console.log('Document created successfully:', documentResult);
      
      // Refresh documents list
      await fetchDocuments();
      
      return { error: null };
    } catch (error) {
      console.error('Upload document unexpected error:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'An unexpected error occurred' 
        } 
      };
    }
  };

  const signDocument = async (documentId: string, signatureData: string) => {
    if (!user || !session) {
      return { error: { message: 'No user found' } };
    }

    try {
      const { error } = await supabase
        .from('document_signatures')
        .insert({
          document_id: documentId,
          signer_id: user.id,
          signature_data: signatureData
        });

      if (error) {
        return { error };
      }

      await fetchDocuments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    signDocument
  };
};
