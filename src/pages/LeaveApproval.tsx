
import { useProfile } from '@/hooks/useProfile';
import LeaveApprovalList from '@/components/LeaveApprovalList';
import { Shield } from 'lucide-react';

const LeaveApproval = () => {
  const { hasRole, loading } = useProfile();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!hasRole('head')) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
          <p className="text-sm text-muted-foreground mt-1">Only HR administrators and heads can approve leave requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and approve employee leave requests</p>
        </div>

        <LeaveApprovalList />
      </div>
    </div>
  );
};

export default LeaveApproval;
