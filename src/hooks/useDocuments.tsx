
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
      } else {
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
    if (!user) return { error: 'No user found' };

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
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
        employee_id: employeeId || null
      };

      const { error } = await supabase
        .from('documents')
        .insert(documentData);

      if (error) {
        return { error };
      }

      await fetchDocuments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signDocument = async (documentId: string, signatureData: string) => {
    if (!user) return { error: 'No user found' };

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
