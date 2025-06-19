
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DocumentTemplate = Database['public']['Tables']['document_templates']['Row'];
type DocumentTemplateInsert = Database['public']['Tables']['document_templates']['Insert'];

export const useDocumentTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
      } else {
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<DocumentTemplateInsert, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('document_templates')
        .insert({
          ...template,
          created_by: user.id
        });

      if (error) {
        return { error };
      }

      await fetchTemplates();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const generateDocument = async (
    templateId: string, 
    variables: Record<string, string>,
    recipientId: string,
    title: string
  ) => {
    if (!user) return { error: 'No user found' };

    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        return { error: templateError };
      }

      // Replace variables in content
      let content = template.content;
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      // Create document
      const { error: docError } = await supabase
        .from('documents')
        .insert({
          title,
          description: `Generated from template: ${template.name}`,
          category: 'shared_documents',
          uploaded_by: user.id,
          recipient_id: recipientId,
          is_system_generated: true,
          template_type: template.template_type,
          status: 'pending_review'
        });

      if (docError) {
        return { error: docError };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    generateDocument
  };
};
