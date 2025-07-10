
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';

const LeaveApprovalList = () => {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest, loading } = useLeaveRequests();
  const { employees } = useEmployees();
  const { hasRole } = useProfile();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Filter requests based on status
  const filteredRequests = leaveRequests?.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  }) || [];

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find(emp => emp.profile_id === employeeId);
    if (employee) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return 'Unknown Employee';
  };

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

  const handleApprove = async (requestId: string) => {
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

  const handleReject = async (requestId: string) => {
    if (!hasRole('manager')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reject leave requests.",
        variant: "destructive"
      });
      return;
    }

    setProcessingRequest(requestId);
    try {
      const { error } = await rejectLeaveRequest(requestId, 'Rejected by manager');
      
      if (error) {
        toast({
          title: "Rejection Failed",
          description: error.message || "Failed to reject leave request",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Leave request rejected successfully."
        });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Rejection Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading leave requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Leave Requests Management
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leave requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {getEmployeeName(request.employee_id)}
                      </h3>
                      {getStatusBadge(request.status || 'pending')}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Leave Type</p>
                        <p className="capitalize">{request.leave_type} Leave</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Duration</p>
                        <p>{request.days_requested} day{request.days_requested !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Start Date</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">End Date</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.end_date)}
                        </p>
                      </div>
                    </div>

                    {request.reason && (
                      <div>
                        <p className="font-medium text-muted-foreground">Reason</p>
                        <p className="text-sm bg-muted p-2 rounded">{request.reason}</p>
                      </div>
                    )}

                    <div>
                      <p className="font-medium text-muted-foreground">Submitted</p>
                      <p className="text-sm">{formatDate(request.created_at || '')}</p>
                    </div>
                  </div>

                  {request.status === 'pending' && hasRole('manager') && (
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(request.id)}
                        disabled={processingRequest === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingRequest === request.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveApprovalList;
