
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
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case 'pending_head':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending_hr':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkflowStageLabel = (stage: string) => {
    switch (stage) {
      case 'pending_head':
        return 'Awaiting Head Review';
      case 'pending_hr':
        return 'Awaiting HR Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Processing';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'sick':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'maternity':
      case 'paternity':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5" />
            My Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
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
            {myRequests.map((request) => {
              const workflowStage = (request as any).workflow_stage || 'pending_head';
              
              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getLeaveTypeColor(request.leave_type)}>
                        {request.leave_type}
                      </Badge>
                      <Badge className={getWorkflowStageColor(workflowStage)}>
                        {getWorkflowStageLabel(workflowStage)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">From: {formatDate(request.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">To: {formatDate(request.end_date)}</span>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Reason:</p>
                      <p className="text-sm text-foreground">{request.reason}</p>
                    </div>
                  )}

                  {/* Only show public comments - internal notes are hidden from employees */}
                  {request.comments && (workflowStage === 'approved' || workflowStage === 'rejected') && (
                    <div className="mb-3 bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {workflowStage === 'approved' ? 'Approval' : 'Rejection'} Comments:
                      </p>
                      <p className="text-sm text-foreground">{request.comments}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Submitted: {formatDate(request.created_at || '')}</span>
                    {request.decision_at && (
                      <span> • Decision: {formatDate(request.decision_at)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyLeaveRequests;
