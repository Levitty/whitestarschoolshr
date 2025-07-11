
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
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';

const Leave = () => {
  const { user } = useAuth();
  const { leaveRequests, loading } = useLeaveRequests();
  const { hasRole, loading: profileLoading } = useProfile();

  // Show loading if any critical data is still loading
  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to access leave management.</p>
        </div>
      </div>
    );
  }

  const getLeaveStats = () => {
    if (!leaveRequests) return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 };
    
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;

    return { totalRequests, pendingRequests, approvedRequests, rejectedRequests };
  };

  const stats = getLeaveStats();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
            <p className="text-slate-600 mt-1">Manage employee leave requests and balances</p>
          </div>
        </div>

        {/* Stats Cards - Only show to heads and superadmins */}
        {hasRole('head') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejectedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="my-requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {hasRole('head') && <TabsTrigger value="approvals">Approvals</TabsTrigger>}
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaveRequestForm />
              <MyLeaveRequests />
            </div>
          </TabsContent>

          {hasRole('head') && (
            <TabsContent value="approvals">
              <LeaveApprovalList />
            </TabsContent>
          )}

          <TabsContent value="balances">
            <LeaveBalanceManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leave;
