
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
      console.log('Fetching documents...');
      
      // First get all documents
      const { data: documentsData, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
        return;
      }

      console.log('Raw documents:', documentsData);

      // If we have documents, enrich them with employee data
      if (documentsData && documentsData.length > 0) {
        const enrichedDocuments = await Promise.all(
          documentsData.map(async (doc) => {
            let employeeData = null;
            
            if (doc.employee_id) {
              // Try to get from employee_profiles first
              const { data: empProfile } = await supabase
                .from('employee_profiles')
                .select('id, first_name, last_name, email, department')
                .eq('id', doc.employee_id)
                .maybeSingle();
              
              if (empProfile) {
                employeeData = { employee_profile: empProfile };
              } else {
                // Fallback to profiles table
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id, first_name, last_name, email, department')
                  .eq('id', doc.employee_id)
                  .maybeSingle();
                
                if (profile) {
                  employeeData = { profile: profile };
                }
              }
            }
            
            return {
              ...doc,
              ...employeeData
            };
          })
        );
        console.log('Enriched documents with employee data:', enrichedDocuments);
        setDocuments(enrichedDocuments);
      } else {
        console.log('No documents found');
        setDocuments([]);
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
      console.log('uploadDocument called with employeeId:', employeeId);
      
      // Upload file
      const fileExt = file.name.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: { message: uploadError.message } };
      }

      // Resolve employee id to attach the document to
      let targetEmployeeId = employeeId || null;
      console.log('Initial targetEmployeeId:', targetEmployeeId);
      
      // If no employee ID provided, try to find current user's employee profile
      if (!targetEmployeeId) {
        console.log('No employeeId provided, looking for current user profile');
        
        // Try to find employee profile by profile_id first
        const { data: empProfile } = await supabase
          .from('employee_profiles')
          .select('id, profile_id')
          .eq('profile_id', user.id)
          .maybeSingle();
          
        if (empProfile?.id) {
          targetEmployeeId = empProfile.id;
          console.log('Found employee profile ID:', targetEmployeeId);
        } else {
          // Fallback: use the user's ID directly (for profiles table)
          targetEmployeeId = user.id;
          console.log('Using user ID as fallback:', targetEmployeeId);
        }
      }

      console.log('Final targetEmployeeId:', targetEmployeeId);

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
          employee_id: targetEmployeeId,
          status: 'approved'
        });

      if (documentError) {
        console.error('Document insert error:', documentError);
        return { error: { message: documentError.message } };
      }

      console.log('Document uploaded successfully with employee_id:', targetEmployeeId);
      await fetchDocuments();
      return { error: null };
    } catch (error) {
      console.error('Upload failed:', error);
      return { error: { message: 'Upload failed' } };
    }
  };

  const createLetter = async (
    title: string,
    content: string,
    employeeId: string,
    letterType: string,
    category: Database['public']['Enums']['document_category'],
    source: 'manual' | 'ai_generated' | 'template',
    templateId?: string
  ) => {
    if (!user) {
      return { error: { message: 'Not authenticated' } };
    }

    try {
      const { error } = await supabase
        .from('documents')
        .insert({
          title,
          category,
          employee_id: employeeId,
          uploaded_by: user.id,
          letter_type: letterType,
          letter_content: content,
          source,
          template_id: templateId,
          status: 'approved'
        });

      if (error) {
        console.error('Letter creation error:', error);
        return { error: { message: error.message } };
      }

      await fetchDocuments();
      return { error: null };
    } catch (error) {
      console.error('Letter creation failed:', error);
      return { error: { message: 'Letter creation failed' } };
    }
  };

  const deleteDocument = async (documentId: string, filePath: string | null) => {
    if (!user) {
      return { error: { message: 'Not authenticated' } };
    }

    try {
      // Delete the file from storage if it exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('employee-documents')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        return { error: { message: error.message } };
      }

      await fetchDocuments();
      return { error: null };
    } catch (error) {
      console.error('Delete failed:', error);
      return { error: { message: 'Delete failed' } };
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    createLetter,
    deleteDocument
  };
};
