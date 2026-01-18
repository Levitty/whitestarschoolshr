import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Monitor, DollarSign, Package, Users, Check, X, Clock, CheckCircle2 } from 'lucide-react';
import { useClearanceApprovals, ClearanceApproval } from '@/hooks/useClearanceApprovals';
import { DepartmentApprovalSection } from './DepartmentApprovalSection';

interface ClearanceApprovalWorkflowProps {
  clearanceId: string;
  onFullyApproved?: () => void;
}

const departmentOrder = ['IT', 'Finance', 'Operations', 'HR'];

const departmentIcons: Record<string, React.ReactNode> = {
  IT: <Monitor className="h-4 w-4" />,
  Finance: <DollarSign className="h-4 w-4" />,
  Operations: <Package className="h-4 w-4" />,
  HR: <Users className="h-4 w-4" />,
};

export const ClearanceApprovalWorkflow = ({
  clearanceId,
  onFullyApproved,
}: ClearanceApprovalWorkflowProps) => {
  const { fetchClearanceApprovals, isFullyApproved } = useClearanceApprovals();
  const { data: approvals, isLoading, refetch } = fetchClearanceApprovals(clearanceId);
  const [fullyApproved, setFullyApproved] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      if (approvals && approvals.length > 0) {
        const allApproved = await isFullyApproved(clearanceId);
        setFullyApproved(allApproved);
        if (allApproved) {
          onFullyApproved?.();
        }
      }
    };
    checkApproval();
  }, [approvals, clearanceId, onFullyApproved, isFullyApproved]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const orderedApprovals = departmentOrder.map(
    (dept) => approvals?.find((a) => a.department === dept)
  ).filter(Boolean) as ClearanceApproval[];

  const approvedCount = orderedApprovals.filter((a) => a.status === 'approved').length;
  const pendingDepartments = orderedApprovals
    .filter((a) => a.status === 'pending')
    .map((a) => a.department);

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'completed';
      case 'rejected':
        return 'error';
      default:
        return 'pending';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Department Approvals</span>
          <Badge variant="secondary">
            {approvedCount} of {departmentOrder.length} approved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Horizontal Stepper */}
        <div className="flex items-center justify-between relative">
          {orderedApprovals.map((approval, index) => {
            const stepStatus = getStepStatus(approval.status);
            const isLast = index === orderedApprovals.length - 1;

            return (
              <div key={approval.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 z-10
                      ${stepStatus === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${stepStatus === 'error' ? 'bg-red-500 border-red-500 text-white' : ''}
                      ${stepStatus === 'pending' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : ''}
                    `}
                  >
                    {stepStatus === 'completed' && <Check className="h-5 w-5" />}
                    {stepStatus === 'error' && <X className="h-5 w-5" />}
                    {stepStatus === 'pending' && departmentIcons[approval.department]}
                  </div>
                  <span className="text-xs mt-2 font-medium">{approval.department}</span>
                </div>
                {!isLast && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2
                      ${orderedApprovals[index + 1]?.status === 'approved' || approval.status === 'approved'
                        ? 'bg-green-300'
                        : 'bg-muted'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Success Banner */}
        {fullyApproved && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ All departments have approved clearance
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Notice */}
        {!fullyApproved && pendingDepartments.length > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Waiting for department approvals: {pendingDepartments.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderedApprovals.map((approval) => (
            <DepartmentApprovalSection
              key={approval.id}
              approval={approval}
              clearanceId={clearanceId}
              onUpdate={() => refetch()}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
