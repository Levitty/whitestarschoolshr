
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
    console.log('Starting document upload - User:', user?.id, 'Session:', !!session);
    
    if (!user || !session) {
      console.error('No authenticated user or session found');
      return { error: { message: 'You must be logged in to upload documents. Please refresh the page and try again.' } };
    }

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to storage:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: uploadError };
      }

      // Create document record
      const documentData: DocumentInsert = {
        title,
        description,
        category,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id,
        employee_id: employeeId || null,
        status: 'draft',
        is_shared: false,
        requires_signature: false
      };

      console.log('Creating document record:', documentData);

      const { error } = await supabase
        .from('documents')
        .insert(documentData);

      if (error) {
        console.error('Database insert error:', error);
        return { error };
      }

      console.log('Document uploaded successfully');
      await fetchDocuments();
      return { error: null };
    } catch (error) {
      console.error('Upload document error:', error);
      return { error };
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
