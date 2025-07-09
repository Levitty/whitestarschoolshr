
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } else {
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
    if (!user) {
      return { error: { message: 'Not authenticated' } };
    }

    try {
      // Upload file
      const fileExt = file.name.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
        return { error: { message: uploadError.message } };
      }

      // Create document record
      const { error: documentError } = await supabase
        .from('documents')
        .insert({
          title,
          description: description || null,
          category,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
          employee_id: employeeId || user.id,
          status: 'approved'
        });

      if (documentError) {
        return { error: { message: documentError.message } };
      }

      await fetchDocuments();
      return { error: null };
    } catch (error) {
      return { error: { message: 'Upload failed' } };
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument
  };
};
