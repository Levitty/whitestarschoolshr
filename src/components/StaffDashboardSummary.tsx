import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, BarChart, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StaffSummary {
  pendingLeaveRequests: number;
  leaveBalance: number;
  myDocuments: number;
  recentEvaluations: number;
  openTickets: number;
}

const StaffDashboardSummary = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<StaffSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStaffSummary();
    }
  }, [user]);

  const fetchStaffSummary = async () => {
    if (!user) return;

    try {
      // First get my employee profile ID
      const { data: myEmployeeProfile } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      const myEmployeeId = myEmployeeProfile?.id;

      const [leaveRequestsResult, leaveBalanceResult, documentsResult, evaluationsResult, ticketsResult] = await Promise.all([
        // My pending leave requests
        supabase
          .from('leave_requests')
          .select('id', { count: 'exact' })
          .eq('employee_id', user.id)
          .eq('status', 'pending'),

        // My leave balance for current year
        supabase
          .from('leave_balances')
          .select('annual_leave_total, annual_leave_used')
          .eq('employee_id', user.id)
          .eq('year', new Date().getFullYear())
          .single(),

        // My documents
        supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .eq('employee_id', user.id),

        // My recent evaluations (last 6 months)
        myEmployeeId 
          ? supabase
              .from('evaluations')
              .select('id', { count: 'exact' })
              .eq('employee_id', myEmployeeId)
              .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
          : { count: 0 },

        // My open tickets
        supabase
          .from('tickets')
          .select('id', { count: 'exact' })
          .eq('employee_id', user.id)
          .in('status', ['open', 'in_progress'])
      ]);

      const leaveBalance = leaveBalanceResult.data 
        ? (leaveBalanceResult.data.annual_leave_total || 0) - (leaveBalanceResult.data.annual_leave_used || 0)
        : 0;

      setSummary({
        pendingLeaveRequests: leaveRequestsResult.count || 0,
        leaveBalance,
        myDocuments: documentsResult.count || 0,
        recentEvaluations: evaluationsResult.count || 0,
        openTickets: ticketsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching staff summary:', error);
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
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pending Leave Requests</CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{summary?.pendingLeaveRequests || 0}</div>
          <p className="text-xs text-slate-500">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Leave Balance</CardTitle>
          <Calendar className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{summary?.leaveBalance || 0}</div>
          <p className="text-xs text-slate-500">Days remaining this year</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">My Documents</CardTitle>
          <FileText className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{summary?.myDocuments || 0}</div>
          <p className="text-xs text-slate-500">Personal documents</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Recent Evaluations</CardTitle>
          <BarChart className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{summary?.recentEvaluations || 0}</div>
          <p className="text-xs text-slate-500">Last 6 months</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboardSummary;