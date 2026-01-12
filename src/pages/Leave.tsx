
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import LeaveApprovalList from '@/components/LeaveApprovalList';
import MyLeaveRequests from '@/components/MyLeaveRequests';
import LeaveBalanceManager from '@/components/LeaveBalanceManager';
import MyLeaveBalance from '@/components/MyLeaveBalance';
import { Calendar, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';

const Leave = () => {
  const { user } = useAuth();
  const { leaveRequests, loading } = useLeaveRequests();
  const { hasRole, loading: profileLoading } = useProfile();

  const isHead = hasRole('head');
  const isHR = hasRole('admin') || hasRole('superadmin');

  // Show loading if any critical data is still loading
  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access leave management.</p>
        </div>
      </div>
    );
  }

  const getLeaveStats = () => {
    if (!leaveRequests) return { 
      totalRequests: 0, 
      pendingHead: 0, 
      pendingHR: 0, 
      approvedRequests: 0, 
      rejectedRequests: 0 
    };
    
    const totalRequests = leaveRequests.length;
    const pendingHead = leaveRequests.filter(req => (req as any).workflow_stage === 'pending_head').length;
    const pendingHR = leaveRequests.filter(req => (req as any).workflow_stage === 'pending_hr').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;

    return { totalRequests, pendingHead, pendingHR, approvedRequests, rejectedRequests };
  };

  const stats = getLeaveStats();

  // Determine number of tabs
  const getTabCount = () => {
    let count = 2; // My Requests + Balance
    if (isHead && !isHR) count++; // Head Review
    if (isHR) count += 2; // Head Review + HR Approval
    return count;
  };

  const tabCount = getTabCount();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee leave requests and balances</p>
          </div>
        </div>

        {/* Stats Cards - Show to heads and HR */}
        {(isHead || isHR) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pending Head</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingHead}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ArrowRight className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pending HR</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingHR}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-foreground">{stats.approvedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-foreground">{stats.rejectedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="my-requests" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-${tabCount}`}>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {(isHead || isHR) && <TabsTrigger value="head-review">Head Review</TabsTrigger>}
            {isHR && <TabsTrigger value="hr-approval">HR Approval</TabsTrigger>}
            <TabsTrigger value="balances">Leave Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaveRequestForm />
              <MyLeaveRequests />
            </div>
          </TabsContent>

          {(isHead || isHR) && (
            <TabsContent value="head-review">
              <LeaveApprovalList mode="head" />
            </TabsContent>
          )}

          {isHR && (
            <TabsContent value="hr-approval">
              <LeaveApprovalList mode="hr" />
            </TabsContent>
          )}

          <TabsContent value="balances">
            {isHR ? <LeaveBalanceManager /> : <MyLeaveBalance />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leave;
