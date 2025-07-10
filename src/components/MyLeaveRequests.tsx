
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, FileText } from 'lucide-react';

const MyLeaveRequests = () => {
  const { user } = useAuth();
  const { leaveRequests, loading } = useLeaveRequests();

  // Filter requests for current user only
  const myRequests = leaveRequests.filter(request => request.employee_id === user?.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-orange-100 text-orange-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'maternity':
      case 'paternity':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        {myRequests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getLeaveTypeColor(request.leave_type)}>
                      {request.leave_type}
                    </Badge>
                    <Badge className={getStatusColor(request.status || 'pending')}>
                      {request.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>From: {formatDate(request.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>To: {formatDate(request.end_date)}</span>
                  </div>
                </div>

                {request.reason && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>
                )}

                {request.comments && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Comments:</p>
                    <p className="text-sm">{request.comments}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Submitted: {formatDate(request.created_at || '')}
                  {request.decision_at && (
                    <span> • Reviewed: {formatDate(request.decision_at)}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyLeaveRequests;
