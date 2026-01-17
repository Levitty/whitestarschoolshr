import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface Evaluation {
  id: string;
  employee_id: string;
  evaluator_id: string;
  period: string;
  type: string;
  branch: string;
  overall_rating: number;
  academic_student_performance: number;
  academic_teaching_strategies: number;
  academic_slow_learners: number;
  academic_initiatives: number;
  academic_total: number;
  academic_comments: string;
  culture_mission_support: number;
  culture_extracurricular: number;
  culture_collaboration: number;
  culture_diversity: number;
  culture_total: number;
  culture_comments: string;
  development_workshops: number;
  development_education: number;
  development_methodologies: number;
  development_mentoring: number;
  development_total: number;
  development_comments: string;
  customer_responsiveness: number;
  customer_communication: number;
  customer_feedback: number;
  customer_conflict_resolution: number;
  customer_total: number;
  customer_comments: string;
  status: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  evaluator_name?: string;
}

interface CreateEvaluationData {
  employee_id: string;
  evaluator_id: string;
  period: string;
  type: string;
  branch: string;
  academic_student_performance: number;
  academic_teaching_strategies: number;
  academic_slow_learners: number;
  academic_initiatives: number;
  academic_comments?: string;
  culture_mission_support: number;
  culture_extracurricular: number;
  culture_collaboration: number;
  culture_diversity: number;
  culture_comments?: string;
  development_workshops: number;
  development_education: number;
  development_methodologies: number;
  development_mentoring: number;
  development_comments?: string;
  customer_responsiveness: number;
  customer_communication: number;
  customer_feedback: number;
  customer_conflict_resolution: number;
  customer_comments?: string;
  status?: string;
}

export const useEvaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { tenant } = useTenant();

  const fetchEvaluations = async () => {
    try {
      // Only fetch if tenant is available
      if (!tenant?.id) {
        console.log('Skipping evaluations fetch - no tenant');
        setEvaluations([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching evaluations for tenant:', tenant.id);
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          employee_profiles!evaluations_employee_id_fkey(first_name, last_name),
          profiles!evaluations_evaluator_id_fkey(first_name, last_name)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching evaluations:', error);
        return;
      }

      const formattedEvaluations = data?.map(evaluation => ({
        ...evaluation,
        employee_name: `${evaluation.employee_profiles?.first_name || ''} ${evaluation.employee_profiles?.last_name || ''}`.trim(),
        evaluator_name: `${evaluation.profiles?.first_name || ''} ${evaluation.profiles?.last_name || ''}`.trim()
      })) || [];

      setEvaluations(formattedEvaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [tenant?.id]);

  const createEvaluation = async (evaluationData: CreateEvaluationData) => {
    try {
      console.log('Creating evaluation with data:', evaluationData);
      
      // Check current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        toast({
          title: "Error",
          description: "You must be logged in to create evaluations.",
          variant: "destructive"
        });
        return null;
      }

      // Check user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Error",
          description: "Could not verify user permissions.",
          variant: "destructive"
        });
        return null;
      }

      console.log('Current user profile:', profile);

      const { data, error } = await supabase
        .from('evaluations')
        .insert(evaluationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating evaluation:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === '42501' || error.message.includes('row-level security')) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to create evaluations. Please contact your administrator.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to create evaluation: ${error.message}`,
            variant: "destructive"
          });
        }
        return null;
      }

      console.log('Evaluation created successfully:', data);
      await fetchEvaluations();
      toast({
        title: "Success",
        description: "Evaluation created successfully."
      });
      return data;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the evaluation.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvaluation = async (id: string, updates: Partial<CreateEvaluationData>) => {
    try {
      const { error } = await supabase
        .from('evaluations')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating evaluation:', error);
        toast({
          title: "Error",
          description: "Failed to update evaluation. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      await fetchEvaluations();
      toast({
        title: "Success",
        description: "Evaluation updated successfully."
      });
      return true;
    } catch (error) {
      console.error('Error updating evaluation:', error);
      return false;
    }
  };

  const getEvaluationAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          academic_total,
          culture_total,
          development_total,
          customer_total,
          overall_rating,
          employee_profiles!evaluations_employee_id_fkey(department)
        `)
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching analytics:', error);
        return null;
      }

      // Calculate averages by department
      const departmentStats = data?.reduce((acc, evaluation) => {
        const dept = evaluation.employee_profiles?.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            academic: [],
            culture: [],
            development: [],
            customer: [],
            overall: []
          };
        }
        acc[dept].academic.push(evaluation.academic_total);
        acc[dept].culture.push(evaluation.culture_total);
        acc[dept].development.push(evaluation.development_total);
        acc[dept].customer.push(evaluation.customer_total);
        acc[dept].overall.push(evaluation.overall_rating);
        return acc;
      }, {} as any);

      // Calculate averages
      const analytics = Object.keys(departmentStats || {}).map(dept => ({
        department: dept,
        academic_avg: departmentStats[dept].academic.reduce((a: number, b: number) => a + b, 0) / departmentStats[dept].academic.length,
        culture_avg: departmentStats[dept].culture.reduce((a: number, b: number) => a + b, 0) / departmentStats[dept].culture.length,
        development_avg: departmentStats[dept].development.reduce((a: number, b: number) => a + b, 0) / departmentStats[dept].development.length,
        customer_avg: departmentStats[dept].customer.reduce((a: number, b: number) => a + b, 0) / departmentStats[dept].customer.length,
        overall_avg: departmentStats[dept].overall.reduce((a: number, b: number) => a + b, 0) / departmentStats[dept].overall.length
      }));

      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  };

  return {
    evaluations,
    loading,
    createEvaluation,
    updateEvaluation,
    fetchEvaluations,
    getEvaluationAnalytics
  };
};
