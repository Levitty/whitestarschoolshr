
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import LeaveBalanceManager from '@/components/LeaveBalanceManager';
import { Calendar, Users, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Leave = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { leaveRequests, approveLeaveRequest, loading } = useLeaveRequests();
  const { hasRole, loading: profileLoading } = useProfile();
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    const colors = {
      pending: 'text-orange-600',
      approved: 'text-green-600', 
      rejected: 'text-red-600'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} 
             className={colors[status as keyof typeof colors] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!hasRole('manager')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve leave requests.",
        variant: "destructive"
      });
      return;
    }

    setProcessingRequest(requestId);
    try {
      const { error } = await approveLeaveRequest(requestId, 'Approved by manager');
      
      if (error) {
        toast({
          title: "Approval Failed",
          description: error.message || "Failed to approve leave request",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Leave request approved successfully."
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Approval Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!hasRole('manager')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reject leave requests.",
        variant: "destructive"
      });
      return;
    }

    // For now, we'll just show a message since reject functionality isn't implemented
    toast({
      title: "Feature Coming Soon",
      description: "Leave request rejection functionality will be available soon.",
    });
  };

  const filteredRequests = selectedEmployee 
    ? leaveRequests?.filter(req => req.employee_id === selectedEmployee) || []
    : leaveRequests || [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
            <p className="text-slate-600 mt-1">Manage employee leave requests and balances</p>
          </div>
        </div>

        {/* Stats Cards */}
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

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaveRequestForm />
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} Leave
                          </h3>
                          {getStatusBadge(request.status || 'pending')}
                        </div>
                        <p className="text-sm text-slate-600">
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {request.days_requested} days
                        </p>
                        {request.reason && (
                          <p className="text-sm text-slate-500 mt-2">{request.reason}</p>
                        )}
                      </div>
                    ))}
                    {filteredRequests.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No leave requests found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle>All Leave Requests</CardTitle>
                {hasRole('manager') && (
                  <div className="flex gap-4">
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Employees</SelectItem>
                        {employees?.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">
                              {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} Leave
                            </h3>
                            {getStatusBadge(request.status || 'pending')}
                          </div>
                          <p className="text-sm text-slate-600">
                            {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.days_requested} days)
                          </p>
                          {request.reason && (
                            <p className="text-sm text-slate-500 mt-1">{request.reason}</p>
                          )}
                        </div>
                        {request.status === 'pending' && hasRole('manager') && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={processingRequest === request.id}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {processingRequest === request.id ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No leave requests found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <LeaveBalanceManager />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Leave calendar view coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leave;
