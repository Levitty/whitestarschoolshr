
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
      console.log('useDocuments - Fetching documents for authenticated user');
      fetchDocuments();
    } else {
      console.log('useDocuments - No authenticated user');
      setDocuments([]);
      setLoading(false);
    }
  }, [user, session]);

  const fetchDocuments = async () => {
    if (!user || !session) {
      console.log('fetchDocuments - No authenticated user');
      return;
    }

    try {
      console.log('Fetching all documents...');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } else {
        console.log('Fetched documents:', data?.length || 0);
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
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
      hasSession: !!session
    });
    
    if (!user || !session) {
      console.error('Authentication required');
      return { 
        error: { 
          message: 'Authentication required. Please sign in.' 
        } 
      };
    }

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      console.log('Uploading file to storage:', { filePath });
      
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

      // Create document record
      const documentData: DocumentInsert = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        uploaded_by: user.id,
        employee_id: employeeId || user.id,
        status: 'approved',
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

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument
  };
};
