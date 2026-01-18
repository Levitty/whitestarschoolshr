import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Monitor, DollarSign, Package, Users, Check, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ClearanceApproval, useClearanceApprovals } from '@/hooks/useClearanceApprovals';
import { useAuth } from '@/hooks/useAuth';

interface DepartmentApprovalSectionProps {
  approval: ClearanceApproval;
  clearanceId: string;
  onUpdate?: () => void;
}

const departmentIcons: Record<string, React.ReactNode> = {
  IT: <Monitor className="h-5 w-5" />,
  Finance: <DollarSign className="h-5 w-5" />,
  Operations: <Package className="h-5 w-5" />,
  HR: <Users className="h-5 w-5" />,
};

export const DepartmentApprovalSection = ({
  approval,
  clearanceId,
  onUpdate,
}: DepartmentApprovalSectionProps) => {
  const { profile } = useAuth();
  const { approveSection, rejectSection, resetApproval, canUserApprove } = useClearanceApprovals();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const userCanApprove = canUserApprove(approval.department);
  const isAdmin = profile?.role && ['admin', 'superadmin'].includes(profile.role);

  const handleApprove = async () => {
    await approveSection.mutateAsync({ approvalId: approval.id, notes });
    setShowApproveDialog(false);
    setNotes('');
    onUpdate?.();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    await rejectSection.mutateAsync({ approvalId: approval.id, rejectionReason });
    setShowRejectDialog(false);
    setRejectionReason('');
    onUpdate?.();
  };

  const handleReset = async () => {
    await resetApproval.mutateAsync(approval.id);
    onUpdate?.();
  };

  const getApproverName = () => {
    if (!approval.approver) return 'Unknown';
    return `${approval.approver.first_name || ''} ${approval.approver.last_name || ''}`.trim() || 'Unknown';
  };

  const renderStatusBadge = () => {
    switch (approval.status) {
      case 'approved':
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <Check className="h-3 w-3 mr-1" /> Approved
            </Badge>
            <span className="text-xs text-muted-foreground">
              by {getApproverName()}
              {approval.approved_at && (
                <> on {format(new Date(approval.approved_at), 'MMM dd, yyyy')}</>
              )}
            </span>
          </div>
        );
      case 'rejected':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col gap-1">
                  <Badge variant="destructive">
                    <X className="h-3 w-3 mr-1" /> Rejected
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    by {getApproverName()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{approval.rejection_reason || 'No reason provided'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            ⏳ Pending Approval
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="p-2 bg-muted rounded-lg">
              {departmentIcons[approval.department] || <Package className="h-5 w-5" />}
            </span>
            {approval.department}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderStatusBadge()}

          {approval.status === 'pending' && userCanApprove && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => setShowApproveDialog(true)}
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}

          {approval.status === 'rejected' && isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleReset}
              disabled={resetApproval.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Reset to Pending
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {approval.department} Clearance</DialogTitle>
            <DialogDescription>
              Confirm that the {approval.department} department has cleared this employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={approveSection.isPending}
            >
              {approveSection.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {approval.department} Clearance</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this clearance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="mt-1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectSection.isPending || !rejectionReason.trim()}
            >
              {rejectSection.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
