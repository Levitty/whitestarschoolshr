import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, PlayCircle, Users, DollarSign, Calculator, Loader2 } from 'lucide-react';
import { usePayroll, EmployeeForPayroll } from '@/hooks/usePayroll';
import { calculatePayroll, formatKES, getMonthName, getCurrentPayrollPeriod } from '@/utils/kenyanPayroll';
import { useToast } from '@/hooks/use-toast';

interface RunPayrollFormProps {
  onPayrollCreated: (runId: string) => void;
}

const RunPayrollForm = ({ onPayrollCreated }: RunPayrollFormProps) => {
  const { toast } = useToast();
  const { runPayroll, checkExistingPayroll, getEmployeesForPayroll, processing } = usePayroll();

  const currentPeriod = getCurrentPayrollPeriod();
  const [month, setMonth] = useState(currentPeriod.month.toString());
  const [year, setYear] = useState(currentPeriod.year.toString());
  const [employees, setEmployees] = useState<EmployeeForPayroll[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [existingRun, setExistingRun] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  // Load employees
  useEffect(() => {
    const load = async () => {
      setLoadingEmployees(true);
      const emps = await getEmployeesForPayroll();
      setEmployees(emps);
      setLoadingEmployees(false);
    };
    load();
  }, [getEmployeesForPayroll]);

  // Check existing payroll and generate preview when month/year changes
  useEffect(() => {
    const check = async () => {
      const m = parseInt(month);
      const y = parseInt(year);
      const existing = await checkExistingPayroll(m, y);
      setExistingRun(existing);

      // Generate preview
      if (employees.length > 0) {
        let totalGross = 0, totalNet = 0, totalPaye = 0, totalDeductions = 0;
        let empCount = 0;

        for (const emp of employees) {
          if (!emp.salary || emp.salary <= 0) continue;
          const result = calculatePayroll(emp.salary);
          totalGross += result.grossSalary;
          totalNet += result.netSalary;
          totalPaye += result.netPaye;
          totalDeductions += result.totalDeductions;
          empCount++;
        }

        setPreviewData({
          employeeCount: empCount,
          totalGross,
          totalNet,
          totalPaye,
          totalDeductions,
        });
      }
    };
    check();
  }, [month, year, employees, checkExistingPayroll]);

  const handleRunPayroll = async () => {
    const m = parseInt(month);
    const y = parseInt(year);

    const result = await runPayroll(m, y);

    if (result.success && result.runId) {
      toast({
        title: 'Payroll Processed',
        description: `${getMonthName(m)} ${y} payroll has been processed successfully.`,
      });
      onPayrollCreated(result.runId);
    } else {
      toast({
        title: 'Payroll Error',
        description: result.error || 'Failed to process payroll',
        variant: 'destructive',
      });
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 3 }, (_, i) => {
    const y = currentPeriod.year - 1 + i;
    return { value: y.toString(), label: y.toString() };
  });

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PlayCircle className="h-5 w-5 text-emerald-600" />
            Run Monthly Payroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Process payroll for all active employees with automatic Kenyan statutory deductions
            (PAYE, SHIF, NSSF, Housing Levy).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {existingRun && (
            <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl mb-6">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Payroll already exists for {getMonthName(parseInt(month))} {year}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Status: {existingRun.status} — {existingRun.employee_count} employees — {formatKES(existingRun.total_net)} net
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Summary */}
      {previewData && !existingRun && (
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
              Payroll Preview — {getMonthName(parseInt(month))} {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{previewData.employeeCount}</div>
                <div className="text-xs text-muted-foreground">Employees</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatKES(previewData.totalGross)}</div>
                <div className="text-xs text-muted-foreground">Total Gross</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-lg font-bold text-red-700 dark:text-red-300">{formatKES(previewData.totalDeductions)}</div>
                <div className="text-xs text-muted-foreground">Total Deductions</div>
              </div>
              <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                <div className="text-lg font-bold text-violet-700 dark:text-violet-300">{formatKES(previewData.totalNet)}</div>
                <div className="text-xs text-muted-foreground">Total Net Pay</div>
              </div>
            </div>

            {/* Employee breakdown */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 text-sm font-medium text-foreground grid grid-cols-12 gap-2">
                <div className="col-span-4">Employee</div>
                <div className="col-span-2 text-right">Basic</div>
                <div className="col-span-2 text-right">Deductions</div>
                <div className="col-span-2 text-right">PAYE</div>
                <div className="col-span-2 text-right">Net Pay</div>
              </div>
              {employees.filter(e => e.salary && e.salary > 0).map(emp => {
                const calc = calculatePayroll(emp.salary!);
                return (
                  <div key={emp.id} className="px-4 py-3 border-t text-sm grid grid-cols-12 gap-2 hover:bg-muted/30 transition-colors">
                    <div className="col-span-4">
                      <div className="font-medium text-foreground">{emp.first_name} {emp.last_name}</div>
                      <div className="text-xs text-muted-foreground">{emp.department || 'N/A'}</div>
                    </div>
                    <div className="col-span-2 text-right text-foreground">{formatKES(emp.salary!)}</div>
                    <div className="col-span-2 text-right text-red-600">{formatKES(calc.totalDeductions)}</div>
                    <div className="col-span-2 text-right text-orange-600">{formatKES(calc.netPaye)}</div>
                    <div className="col-span-2 text-right font-medium text-emerald-600">{formatKES(calc.netSalary)}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                size="lg"
                onClick={handleRunPayroll}
                disabled={processing || previewData.employeeCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Process Payroll for {getMonthName(parseInt(month))} {year}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee List Loading State */}
      {loadingEmployees && (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading employees...</p>
          </CardContent>
        </Card>
      )}

      {!loadingEmployees && employees.length === 0 && (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Employees</h3>
            <p className="text-gray-500">Add employees with salary data to start processing payroll.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RunPayrollForm;
