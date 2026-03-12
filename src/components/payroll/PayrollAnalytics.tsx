import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { usePayroll } from '@/hooks/usePayroll';
import { formatKES, getMonthName } from '@/utils/kenyanPayroll';

const PayrollAnalytics = () => {
  const { payrollRuns } = usePayroll();

  const analytics = useMemo(() => {
    if (payrollRuns.length === 0) return null;

    // Sort by date for trending
    const sorted = [...payrollRuns]
      .filter(r => r.status === 'paid' || r.status === 'approved')
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

    // Total spent this year
    const currentYear = new Date().getFullYear();
    const thisYearRuns = sorted.filter(r => r.year === currentYear);
    const totalSpentThisYear = thisYearRuns.reduce((sum, r) => sum + r.total_net, 0);
    const totalGrossThisYear = thisYearRuns.reduce((sum, r) => sum + r.total_gross, 0);
    const totalPayeThisYear = thisYearRuns.reduce((sum, r) => sum + r.total_paye, 0);
    const totalStatutoryThisYear = thisYearRuns.reduce(
      (sum, r) => sum + r.total_paye + r.total_shif + r.total_nssf + r.total_housing_levy, 0
    );

    // Month over month change
    let momChange = 0;
    if (previous && latest) {
      momChange = latest.total_gross > 0 && previous.total_gross > 0
        ? ((latest.total_gross - previous.total_gross) / previous.total_gross) * 100
        : 0;
    }

    // Average cost per employee
    const avgCostPerEmployee = latest ? latest.total_employer_cost / (latest.employee_count || 1) : 0;

    return {
      latest,
      previous,
      sorted,
      totalSpentThisYear,
      totalGrossThisYear,
      totalPayeThisYear,
      totalStatutoryThisYear,
      momChange,
      avgCostPerEmployee,
      monthCount: thisYearRuns.length,
    };
  }, [payrollRuns]);

  if (!analytics || payrollRuns.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Analytics Available</h3>
          <p className="text-gray-500">Process and approve payroll to see analytics here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year to Date Summary */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {new Date().getFullYear()} Year-to-Date Payroll Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatKES(analytics.totalGrossThisYear)}</div>
              <div className="text-xs text-muted-foreground">Total Gross</div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatKES(analytics.totalSpentThisYear)}</div>
              <div className="text-xs text-muted-foreground">Total Net Paid</div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
              <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{formatKES(analytics.totalStatutoryThisYear)}</div>
              <div className="text-xs text-muted-foreground">Statutory Deductions</div>
            </div>
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-center">
              <div className="text-lg font-bold text-violet-700 dark:text-violet-300">{analytics.monthCount}</div>
              <div className="text-xs text-muted-foreground">Months Processed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest vs Previous Month */}
      {analytics.latest && (
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Latest Payroll — {getMonthName(analytics.latest.month)} {analytics.latest.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Employee Costs</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employees</span>
                    <span className="font-medium">{analytics.latest.employee_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Cost / Employee</span>
                    <span className="font-medium">{formatKES(analytics.avgCostPerEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Employer Cost</span>
                    <span className="font-bold">{formatKES(analytics.latest.total_employer_cost)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Deduction Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PAYE</span>
                    <span className="font-medium text-orange-600">{formatKES(analytics.latest.total_paye)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SHIF</span>
                    <span className="font-medium text-blue-600">{formatKES(analytics.latest.total_shif)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NSSF</span>
                    <span className="font-medium text-violet-600">{formatKES(analytics.latest.total_nssf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Housing Levy</span>
                    <span className="font-medium text-teal-600">{formatKES(analytics.latest.total_housing_levy)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Month-over-Month</h4>
                {analytics.previous ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous Gross</span>
                      <span className="font-medium">{formatKES(analytics.previous.total_gross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Gross</span>
                      <span className="font-medium">{formatKES(analytics.latest.total_gross)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Change</span>
                      <span className={`font-bold ${analytics.momChange >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {analytics.momChange >= 0 ? '+' : ''}{analytics.momChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Need at least 2 payroll runs for comparison.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly History Table */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <PieChart className="h-5 w-5 text-violet-600" />
            Monthly Payroll Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 text-xs font-medium text-foreground grid grid-cols-6 gap-2">
              <div>Period</div>
              <div className="text-right">Employees</div>
              <div className="text-right">Gross</div>
              <div className="text-right">Deductions</div>
              <div className="text-right">Net</div>
              <div className="text-right">Status</div>
            </div>
            {analytics.sorted.map(run => (
              <div key={run.id} className="px-4 py-3 border-t text-sm grid grid-cols-6 gap-2 hover:bg-muted/30">
                <div className="font-medium">{getMonthName(run.month).substring(0, 3)} {run.year}</div>
                <div className="text-right">{run.employee_count}</div>
                <div className="text-right">{formatKES(run.total_gross)}</div>
                <div className="text-right text-red-600">{formatKES(run.total_gross - run.total_net)}</div>
                <div className="text-right text-emerald-600 font-medium">{formatKES(run.total_net)}</div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    run.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    run.status === 'approved' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollAnalytics;
