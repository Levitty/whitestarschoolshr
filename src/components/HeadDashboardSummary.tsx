import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface HeadSummary {
  teamMembers: number;
  pendingLeaveRequests: number;
  teamDocuments: number;
  recentEvaluations: number;
}

const HeadDashboardSummary = () => {
  const { profile } = useProfile();
  const [summary, setSummary] = useState<HeadSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.department) {
      fetchHeadSummary();
    }
  }, [profile]);

  const fetchHeadSummary = async () => {
    if (!profile?.department) return;

    try {
      // First get team members in the department
      const { data: teamMembers } = await supabase
        .from('employee_profiles')
        .select('profile_id, id')
        .eq('department', profile.department)
        .eq('status', 'active');

      const teamProfileIds = teamMembers?.map(member => member.profile_id).filter(Boolean) || [];
      const teamEmployeeIds = teamMembers?.map(member => member.id).filter(Boolean) || [];

      const [leaveRequestsResult, documentsResult, evaluationsResult] = await Promise.all([
        // Pending leave requests from team
        teamProfileIds.length > 0 
          ? supabase
              .from('leave_requests')
              .select('id', { count: 'exact' })
              .eq('status', 'pending')
              .in('employee_id', teamProfileIds)
          : { count: 0 },

        // Team documents
        teamProfileIds.length > 0
          ? supabase
              .from('documents')
              .select('id', { count: 'exact' })
              .in('employee_id', teamProfileIds)
          : { count: 0 },

        // Recent evaluations (last 30 days)
        teamEmployeeIds.length > 0
          ? supabase
              .from('evaluations')
              .select('id', { count: 'exact' })
              .in('employee_id', teamEmployeeIds)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          : { count: 0 }
      ]);

      setSummary({
        teamMembers: teamMembers?.length || 0,
        pendingLeaveRequests: leaveRequestsResult.count || 0,
        teamDocuments: documentsResult.count || 0,
        recentEvaluations: evaluationsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching head summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Team Members</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{summary?.teamMembers || 0}</div>
          <p className="text-xs text-slate-500">Active employees in {profile?.department}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pending Leave Requests</CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{summary?.pendingLeaveRequests || 0}</div>
          <p className="text-xs text-slate-500">Awaiting your approval</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Team Documents</CardTitle>
          <FileText className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{summary?.teamDocuments || 0}</div>
          <p className="text-xs text-slate-500">Total documents</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Recent Evaluations</CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{summary?.recentEvaluations || 0}</div>
          <p className="text-xs text-slate-500">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeadDashboardSummary;