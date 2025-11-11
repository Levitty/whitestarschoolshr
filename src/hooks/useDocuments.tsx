
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
            let isActive = true;
            
            if (doc.employee_id) {
              // Try to get from employee_profiles first (only active employees)
              const { data: empProfile } = await supabase
                .from('employee_profiles')
                .select('id, profile_id, first_name, last_name, email, department, status')
                .eq('profile_id', doc.employee_id)
                .eq('status', 'active')
                .maybeSingle();
              
              if (empProfile) {
                employeeData = { employee_profile: empProfile };
                isActive = true;
              } else {
                // Check if employee exists but is inactive
                const { data: inactiveProfile } = await supabase
                  .from('employee_profiles')
                  .select('status')
                  .eq('profile_id', doc.employee_id)
                  .maybeSingle();
                
                if (inactiveProfile) {
                  // Employee exists but is inactive - don't include this document
                  isActive = false;
                } else {
                  // Fallback to profiles table (for users without employee_profiles)
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
            }
            
            return {
              ...doc,
              ...employeeData,
              isActive
            };
          })
        );
        
        // Filter out documents from inactive/deleted employees
        const activeDocuments = enrichedDocuments.filter((doc: any) => doc.isActive !== false);
        console.log('Enriched documents with active employee data:', activeDocuments);
        setDocuments(activeDocuments);
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
      
      // Upload file with user ID in path for RLS
      const fileExt = file.name.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: { message: uploadError.message } };
      }

      // Resolve employee id and employee number
      let targetEmployeeId = employeeId || user.id; // Default to current user
      let targetEmployeeNumber: string | null = null;
      console.log('Target employee ID:', targetEmployeeId);
      
      // Try to fetch employee number from employee_profiles
      // First try by profile_id (most common case)
      const { data: empProfile } = await supabase
        .from('employee_profiles')
        .select('employee_number')
        .eq('profile_id', targetEmployeeId)
        .maybeSingle();
      
      if (empProfile) {
        targetEmployeeNumber = empProfile.employee_number;
        console.log('Found employee number:', targetEmployeeNumber);
      }

      console.log('Inserting document with employee_id:', targetEmployeeId, 'employee_number:', targetEmployeeNumber);

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
          employee_number: targetEmployeeNumber,
          status: 'approved'
        });

      if (documentError) {
        console.error('Document insert error:', documentError);
        return { error: { message: documentError.message } };
      }

      console.log('Document uploaded successfully');
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
      // Fetch employee number for the given employee ID
      // First try by profile_id (when admin passes profiles.id)
      let empProfile = await supabase
        .from('employee_profiles')
        .select('employee_number')
        .eq('profile_id', employeeId)
        .maybeSingle();
      
      if (!empProfile.data) {
        // Fallback: try by id (when admin passes employee_profiles.id)
        empProfile = await supabase
          .from('employee_profiles')
          .select('employee_number')
          .eq('id', employeeId)
          .maybeSingle();
      }

      const { error } = await supabase
        .from('documents')
        .insert({
          title,
          category,
          employee_id: employeeId,
          employee_number: empProfile?.data?.employee_number || null,
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
