import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

export interface CorporateEvaluation {
  id: string;
  employee_id: string;
  evaluator_id: string;
  tenant_id: string | null;
  period: string;
  evaluation_type: 'quarterly' | 'annual' | 'probation';
  technical_skills: number | null;
  quality_of_work: number | null;
  productivity: number | null;
  communication: number | null;
  teamwork: number | null;
  technical_skills_comments: string | null;
  quality_of_work_comments: string | null;
  productivity_comments: string | null;
  communication_comments: string | null;
  teamwork_comments: string | null;
  overall_rating: number | null;
  strengths: string | null;
  improvement_areas: string | null;
  goals: string | null;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
  updated_at: string;
  employee?: {
    first_name: string;
    last_name: string;
    department: string;
    position: string;
  };
  evaluator?: {
    first_name: string;
    last_name: string;
  };
}

export interface CorporateEvaluationInsert {
  employee_id: string;
  evaluator_id: string;
  tenant_id?: string | null;
  period: string;
  evaluation_type: 'quarterly' | 'annual' | 'probation';
  technical_skills?: number | null;
  quality_of_work?: number | null;
  productivity?: number | null;
  communication?: number | null;
  teamwork?: number | null;
  technical_skills_comments?: string | null;
  quality_of_work_comments?: string | null;
  productivity_comments?: string | null;
  communication_comments?: string | null;
  teamwork_comments?: string | null;
  strengths?: string | null;
  improvement_areas?: string | null;
  goals?: string | null;
  status?: 'draft' | 'submitted' | 'approved';
}

export const useCorporateEvaluations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  const fetchEvaluations = useQuery({
    queryKey: ['corporate-evaluations', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_evaluations')
        .select(`
          *,
          employee:employee_profiles!corporate_evaluations_employee_id_fkey(
            first_name,
            last_name,
            department,
            position
          ),
          evaluator:profiles!corporate_evaluations_evaluator_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CorporateEvaluation[];
    },
    enabled: !!tenant?.id,
  });

  const fetchEmployeeEvaluations = (employeeId: string) => {
    return useQuery({
      queryKey: ['corporate-evaluations', 'employee', employeeId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('corporate_evaluations')
          .select(`
            *,
            evaluator:profiles!corporate_evaluations_evaluator_id_fkey(
              first_name,
              last_name
            )
          `)
          .eq('employee_id', employeeId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CorporateEvaluation[];
      },
      enabled: !!employeeId,
    });
  };

  const createEvaluation = useMutation({
    mutationFn: async (data: CorporateEvaluationInsert) => {
      const { data: result, error } = await supabase
        .from('corporate_evaluations')
        .insert({
          ...data,
          tenant_id: tenant?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-evaluations'] });
      toast({
        title: 'Success',
        description: 'Corporate evaluation created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create evaluation.',
        variant: 'destructive',
      });
    },
  });

  const updateEvaluation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CorporateEvaluationInsert> }) => {
      const { data: result, error } = await supabase
        .from('corporate_evaluations')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-evaluations'] });
      toast({
        title: 'Success',
        description: 'Evaluation updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update evaluation.',
        variant: 'destructive',
      });
    },
  });

  const deleteEvaluation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('corporate_evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-evaluations'] });
      toast({
        title: 'Success',
        description: 'Evaluation deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete evaluation.',
        variant: 'destructive',
      });
    },
  });

  const getAnalytics = useQuery({
    queryKey: ['corporate-evaluations', 'analytics', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_evaluations')
        .select(`
          overall_rating,
          technical_skills,
          quality_of_work,
          productivity,
          communication,
          teamwork,
          status,
          employee:employee_profiles!corporate_evaluations_employee_id_fkey(
            department
          )
        `)
        .eq('status', 'approved');

      if (error) throw error;

      // Calculate analytics
      const totalEvaluations = data.length;
      const avgOverall = data.reduce((sum, e) => sum + (e.overall_rating || 0), 0) / totalEvaluations || 0;
      const avgTechnical = data.reduce((sum, e) => sum + (e.technical_skills || 0), 0) / totalEvaluations || 0;
      const avgQuality = data.reduce((sum, e) => sum + (e.quality_of_work || 0), 0) / totalEvaluations || 0;
      const avgProductivity = data.reduce((sum, e) => sum + (e.productivity || 0), 0) / totalEvaluations || 0;
      const avgCommunication = data.reduce((sum, e) => sum + (e.communication || 0), 0) / totalEvaluations || 0;
      const avgTeamwork = data.reduce((sum, e) => sum + (e.teamwork || 0), 0) / totalEvaluations || 0;

      // Group by department
      const byDepartment: Record<string, { count: number; totalRating: number }> = {};
      data.forEach((e) => {
        const dept = e.employee?.department || 'Unknown';
        if (!byDepartment[dept]) {
          byDepartment[dept] = { count: 0, totalRating: 0 };
        }
        byDepartment[dept].count++;
        byDepartment[dept].totalRating += e.overall_rating || 0;
      });

      const departmentAverages = Object.entries(byDepartment).map(([dept, stats]) => ({
        department: dept,
        averageRating: stats.totalRating / stats.count,
        count: stats.count,
      }));

      return {
        totalEvaluations,
        averages: {
          overall: avgOverall,
          technical_skills: avgTechnical,
          quality_of_work: avgQuality,
          productivity: avgProductivity,
          communication: avgCommunication,
          teamwork: avgTeamwork,
        },
        departmentAverages,
      };
    },
    enabled: !!tenant?.id,
  });

  return {
    evaluations: fetchEvaluations.data || [],
    isLoading: fetchEvaluations.isLoading,
    error: fetchEvaluations.error,
    fetchEmployeeEvaluations,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    analytics: getAnalytics.data,
    analyticsLoading: getAnalytics.isLoading,
    refetch: fetchEvaluations.refetch,
  };
};
