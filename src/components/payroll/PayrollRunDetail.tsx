import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, DollarSign, Users, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePayroll, PayrollItem, PayrollRun } from '@/hooks/usePayroll';
import { formatKES, getMonthName } from '@/utils/kenyanPayroll';
import PayslipCard from './PayslipCard';

interface PayrollRunDetailProps {
  runId: string;
  onBack: () => void;
}

const PayrollRunDetail = ({ runId, onBack }: PayrollRunDetailProps) => {
  const { payrollRuns, fetchPayrollItems, currentPayrollItems } = usePayroll();
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<string | null>(null);

  const run = payrollRuns.find(r => r.id === runId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPayrollItems(runId);
      setLoading(false);
    };
    load();
  }, [runId, fetchPayrollItems]);

  if (!run) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Payroll run not found.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to History
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'approved': return 'bg-amber-100 text-amber-700';
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">
            {getMonthName(run.month)} {run.year} Payroll
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(run.status)}>
              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {run.employee_count} employees
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatKES(run.total_gross)}</div>
            <div className="text-xs text-muted-foreground">Total Gross</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatKES(run.total_net)}</div>
            <div className="text-xs text-muted-foreground">Total Net Pay</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{formatKES(run.total_paye)}</div>
            <div className="text-xs text-muted-foreground">Total PAYE</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-violet-700 dark:text-violet-300">{formatKES(run.total_employer_cost)}</div>
            <div className="text-xs text-muted-foreground">Employer Cost</div>
          </CardContent>
        </Card>
      </div>

      {/* Statutory Remittance Summary */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Statutory Remittance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300">KRA (PAYE)</div>
              <div className="text-lg font-bold text-orange-800 dark:text-orange-200">{formatKES(run.total_paye)}</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">SHIF</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">{formatKES(run.total_shif)}</div>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-center">
              <div className="text-sm font-medium text-violet-700 dark:text-violet-300">NSSF</div>
              <div className="text-lg font-bold text-violet-800 dark:text-violet-200">
                {formatKES(run.total_nssf * 2)}
              </div>
              <div className="text-[10px] text-muted-foreground">Employee + Employer</div>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-center">
              <div className="text-sm font-medium text-teal-700 dark:text-teal-300">Housing Levy</div>
              <div className="text-lg font-bold text-teal-800 dark:text-teal-200">
                {formatKES(run.total_housing_levy * 2)}
              </div>
              <div className="text-[10px] text-muted-foreground">Employee + Employer</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Payslips */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-blue-600" />
            Employee Payslips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading payslips...</p>
            </div>
          ) : currentPayrollItems.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No payslip records found.</p>
          ) : (
            <div className="space-y-3">
              {currentPayrollItems.map((item) => (
                <PayslipCard
                  key={item.id}
                  item={item}
                  month={run.month}
                  year={run.year}
                  isExpanded={selectedPayslip === item.id}
                  onToggle={() => setSelectedPayslip(selectedPayslip === item.id ? null : item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollRunDetail;
