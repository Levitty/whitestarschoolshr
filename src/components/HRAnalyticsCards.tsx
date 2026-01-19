
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, Calendar, Briefcase, FileText, BarChart, Clock, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Analytics {
  totalEmployees: number;
  newHiresThisMonth: number;
  pendingLeaveRequests: number;
  newJobApplications: number;
  documentsUploaded: number;
  evaluationsThisWeek: number;
  expiringDocuments: number;
  upskillingEmployees: number;
}

const HRAnalyticsCards = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get current date ranges
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

      // Fetch all analytics in parallel
      const [
        totalEmployeesResult,
        newHiresResult,
        pendingLeaveResult,
        newApplicationsResult,
        documentsResult,
        evaluationsResult,
        expiringDocsResult,
        upskillingResult
      ] = await Promise.all([
        // Total Employees from employee_profiles table
        supabase.from('employee_profiles').select('id', { count: 'exact', head: true }),
        
        // New Hires This Month
        supabase
          .from('employee_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth.toISOString()),
        
        // Pending Leave Requests
        supabase
          .from('leave_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // New Job Applications (7 days)
        supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .gte('applied_at', sevenDaysAgo.toISOString()),
        
        // Documents Uploaded (7 days)
        supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        
        // Evaluations This Week (using interview_records as proxy for performance reviews)
        supabase
          .from('interview_records')
          .select('id', { count: 'exact', head: true })
          .gte('interview_date', startOfWeek.toISOString())
          .lte('interview_date', endOfWeek.toISOString()),
        
        // Expiring Documents (next 30 days) - using contract_end_date as proxy
        supabase
          .from('employee_profiles')
          .select('id', { count: 'exact', head: true })
          .not('contract_end_date', 'is', null)
          .lte('contract_end_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .gte('contract_end_date', now.toISOString().split('T')[0]),
        
        // Employees in Upskilling Programs (using recruitment_assessments as proxy)
        supabase
          .from('recruitment_assessments')
          .select('candidate_email', { count: 'exact', head: true })
          .eq('status', 'pending')
      ]);

      setAnalytics({
        totalEmployees: totalEmployeesResult.count || 0,
        newHiresThisMonth: newHiresResult.count || 0,
        pendingLeaveRequests: pendingLeaveResult.count || 0,
        newJobApplications: newApplicationsResult.count || 0,
        documentsUploaded: documentsResult.count || 0,
        evaluationsThisWeek: evaluationsResult.count || 0,
        expiringDocuments: expiringDocsResult.count || 0,
        upskillingEmployees: upskillingResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        totalEmployees: 0,
        newHiresThisMonth: 0,
        pendingLeaveRequests: 0,
        newJobApplications: 0,
        documentsUploaded: 0,
        evaluationsThisWeek: 0,
        expiringDocuments: 0,
        upskillingEmployees: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number) => {
    return count === 0 ? 'None' : count.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-24">
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index + 4} className="h-24">
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">System Overview</h2>
      
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.totalEmployees)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Hires This Month</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.newHiresThisMonth)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Leave Requests</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.pendingLeaveRequests)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Applications (7d)</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.newJobApplications)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents Uploaded (7d)</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.documentsUploaded)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Evaluations This Week</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.evaluationsThisWeek)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Contracts (30d)</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.expiringDocuments)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Assessments</p>
                <p className="text-2xl font-bold text-foreground">{formatCount(analytics.upskillingEmployees)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRAnalyticsCards;
