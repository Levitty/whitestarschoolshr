
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, FileText } from 'lucide-react';

const MyLeaveRequests = () => {
  const { leaveRequests, loading } = useLeaveRequests();
  const { user } = useAuth();

  // Filter to show only current user's requests
  const myRequests = leaveRequests?.filter(request => request.employee_id === user?.id) || [];

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading your requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Leave Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leave requests found</p>
              <p className="text-sm">Submit your first leave request to see it here</p>
            </div>
          ) : (
            myRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">
                    {request.leave_type} Leave
                  </h4>
                  {getStatusBadge(request.status || 'pending')}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.start_date)} - {formatDate(request.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {request.reason && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {request.reason}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Submitted: {formatDate(request.created_at || '')}
                  {request.decision_at && (
                    <span> • Reviewed: {formatDate(request.decision_at)}</span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyLeaveRequests;
