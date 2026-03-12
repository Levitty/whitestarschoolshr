import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Eye, CheckCircle, Banknote, Trash2, Loader2 } from 'lucide-react';
import { usePayroll } from '@/hooks/usePayroll';
import { formatKES, getMonthName } from '@/utils/kenyanPayroll';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface PayrollHistoryProps {
  onViewRun: (runId: string) => void;
}

const PayrollHistory = ({ onViewRun }: PayrollHistoryProps) => {
  const { payrollRuns, loading, approvePayroll, markAsPaid, deletePayrollRun } = usePayroll();
  const { canAccessAdmin, canAccessSuperAdmin } = useProfile();
  const { toast } = useToast();
  const isPrivileged = canAccessAdmin() || canAccessSuperAdmin();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Draft</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Approved</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (runId: string, month: number, year: number) => {
    const success = await approvePayroll(runId);
    if (success) {
      toast({ title: 'Payroll Approved', description: `${getMonthName(month)} ${year} payroll approved.` });
    } else {
      toast({ title: 'Error', description: 'Failed to approve payroll', variant: 'destructive' });
    }
  };

  const handleMarkPaid = async (runId: string, month: number, year: number) => {
    const success = await markAsPaid(runId);
    if (success) {
      toast({ title: 'Payroll Marked as Paid', description: `${getMonthName(month)} ${year} marked as paid.` });
    } else {
      toast({ title: 'Error', description: 'Failed to mark payroll as paid', variant: 'destructive' });
    }
  };

  const handleDelete = async (runId: string, month: number, year: number) => {
    if (!confirm(`Delete ${getMonthName(month)} ${year} payroll? This cannot be undone.`)) return;
    const success = await deletePayrollRun(runId);
    if (success) {
      toast({ title: 'Payroll Deleted', description: `${getMonthName(month)} ${year} payroll deleted.` });
    } else {
      toast({ title: 'Error', description: 'Failed to delete payroll', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading payroll history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5 text-blue-600" />
            Payroll History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payrollRuns.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Payroll History</h3>
              <p className="text-gray-500">Process your first payroll to see history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payrollRuns.map((run) => (
                <div
                  key={run.id}
                  className="border rounded-xl p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground text-lg">
                          {getMonthName(run.month)} {run.year}
                        </h3>
                        {getStatusBadge(run.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Employees:</span>
                          <span className="ml-1 font-medium">{run.employee_count}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gross:</span>
                          <span className="ml-1 font-medium">{formatKES(run.total_gross)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net:</span>
                          <span className="ml-1 font-medium text-emerald-600">{formatKES(run.total_net)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">PAYE:</span>
                          <span className="ml-1 font-medium text-orange-600">{formatKES(run.total_paye)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => onViewRun(run.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {isPrivileged && run.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleApprove(run.id, run.month, run.year)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(run.id, run.month, run.year)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {isPrivileged && run.status === 'approved' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleMarkPaid(run.id, run.month, run.year)}
                        >
                          <Banknote className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollHistory;
