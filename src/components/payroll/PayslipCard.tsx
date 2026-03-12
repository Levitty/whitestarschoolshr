import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Download, User } from 'lucide-react';
import { PayrollItem } from '@/hooks/usePayroll';
import { formatKES, getMonthName } from '@/utils/kenyanPayroll';

interface PayslipCardProps {
  item: PayrollItem;
  month: number;
  year: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const PayslipCard = ({ item, month, year, isExpanded, onToggle }: PayslipCardProps) => {

  const handleExportPayslip = () => {
    // Generate payslip as printable HTML
    const payslipHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Payslip - ${item.employee_name} - ${getMonthName(month)} ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #059669; margin-bottom: 4px; }
    .header p { color: #666; font-size: 14px; }
    .period { background: #f0fdf4; padding: 12px 20px; border-radius: 8px; text-align: center; margin-bottom: 24px; font-weight: 600; color: #166534; }
    .employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .info-item { font-size: 13px; }
    .info-item span:first-child { color: #666; }
    .info-item span:last-child { font-weight: 600; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 700; color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .row.total { border-top: 2px solid #333; font-weight: 700; font-size: 15px; padding-top: 12px; margin-top: 8px; }
    .row.subtotal { border-top: 1px solid #e5e7eb; font-weight: 600; padding-top: 8px; margin-top: 4px; }
    .amount { text-align: right; font-variant-numeric: tabular-nums; }
    .amount.negative { color: #dc2626; }
    .amount.positive { color: #059669; }
    .net-pay { background: #059669; color: white; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 24px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>PAYSLIP</h1>
    <p>Confidential Employee Salary Statement</p>
  </div>

  <div class="period">${getMonthName(month)} ${year}</div>

  <div class="employee-info">
    <div class="info-item"><span>Employee: </span><span>${item.employee_name}</span></div>
    <div class="info-item"><span>Employee No: </span><span>${item.employee_number || 'N/A'}</span></div>
    <div class="info-item"><span>Department: </span><span>${item.department || 'N/A'}</span></div>
    <div class="info-item"><span>Pay Period: </span><span>${getMonthName(month)} 1-${new Date(year, month, 0).getDate()}, ${year}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Earnings</div>
    <div class="row"><span>Basic Salary</span><span class="amount">${formatKES(item.basic_salary)}</span></div>
    ${item.house_allowance > 0 ? `<div class="row"><span>House Allowance</span><span class="amount">${formatKES(item.house_allowance)}</span></div>` : ''}
    ${item.transport_allowance > 0 ? `<div class="row"><span>Transport Allowance</span><span class="amount">${formatKES(item.transport_allowance)}</span></div>` : ''}
    ${item.overtime_allowance > 0 ? `<div class="row"><span>Overtime</span><span class="amount">${formatKES(item.overtime_allowance)}</span></div>` : ''}
    ${item.other_allowances > 0 ? `<div class="row"><span>Other Allowances</span><span class="amount">${formatKES(item.other_allowances)}</span></div>` : ''}
    <div class="row subtotal"><span>Gross Salary</span><span class="amount">${formatKES(item.gross_salary)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Statutory Deductions</div>
    <div class="row"><span>PAYE (Tax)</span><span class="amount negative">${formatKES(item.net_paye)}</span></div>
    <div class="row" style="font-size: 11px; color: #888;"><span>&nbsp;&nbsp;Gross PAYE: ${formatKES(item.paye)} | Personal Relief: -${formatKES(item.personal_relief)} | Insurance Relief: -${formatKES(item.insurance_relief)}</span></div>
    <div class="row"><span>SHIF (Health Insurance)</span><span class="amount negative">${formatKES(item.shif)}</span></div>
    <div class="row"><span>NSSF Tier I</span><span class="amount negative">${formatKES(item.nssf_tier_i)}</span></div>
    <div class="row"><span>NSSF Tier II</span><span class="amount negative">${formatKES(item.nssf_tier_ii)}</span></div>
    <div class="row"><span>Housing Levy (1.5%)</span><span class="amount negative">${formatKES(item.housing_levy)}</span></div>
  </div>

  ${(item.loan_repayment > 0 || item.sacco_contribution > 0 || item.union_dues > 0 || item.other_deductions > 0) ? `
  <div class="section">
    <div class="section-title">Other Deductions</div>
    ${item.loan_repayment > 0 ? `<div class="row"><span>Loan Repayment</span><span class="amount negative">${formatKES(item.loan_repayment)}</span></div>` : ''}
    ${item.sacco_contribution > 0 ? `<div class="row"><span>SACCO Contribution</span><span class="amount negative">${formatKES(item.sacco_contribution)}</span></div>` : ''}
    ${item.union_dues > 0 ? `<div class="row"><span>Union Dues</span><span class="amount negative">${formatKES(item.union_dues)}</span></div>` : ''}
    ${item.other_deductions > 0 ? `<div class="row"><span>Other Deductions</span><span class="amount negative">${formatKES(item.other_deductions)}</span></div>` : ''}
  </div>
  ` : ''}

  <div class="section">
    <div class="row total"><span>Total Deductions</span><span class="amount negative">${formatKES(item.total_deductions)}</span></div>
  </div>

  <div class="net-pay">
    <span>NET PAY</span>
    <span>${formatKES(item.net_salary)}</span>
  </div>

  <div class="footer">
    <p>This is a computer-generated payslip. For queries, contact your HR department.</p>
    <p>Generated on ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([payslipHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        URL.revokeObjectURL(url);
      };
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-medium text-foreground">{item.employee_name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.employee_number || 'N/A'} • {item.department || 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600">{formatKES(item.net_salary)}</div>
                <div className="text-xs text-muted-foreground">Net Pay</div>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t">
            {/* Earnings */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Earnings</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium">{formatKES(item.basic_salary)}</span>
                </div>
                {item.house_allowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">House Allowance</span>
                    <span className="font-medium">{formatKES(item.house_allowance)}</span>
                  </div>
                )}
                {item.transport_allowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport Allowance</span>
                    <span className="font-medium">{formatKES(item.transport_allowance)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Gross Salary</span>
                  <span>{formatKES(item.gross_salary)}</span>
                </div>
              </div>
            </div>

            {/* Statutory Deductions */}
            <div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Statutory Deductions</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAYE (Income Tax)</span>
                  <span className="font-medium text-red-600">-{formatKES(item.net_paye)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SHIF (Health)</span>
                  <span className="font-medium text-red-600">-{formatKES(item.shif)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NSSF (Pension)</span>
                  <span className="font-medium text-red-600">-{formatKES(item.nssf_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Housing Levy</span>
                  <span className="font-medium text-red-600">-{formatKES(item.housing_levy)}</span>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-lg">Net Pay</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xl">{formatKES(item.net_salary)}</span>
              </div>
            </div>

            {/* Export */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleExportPayslip}>
                <Download className="h-4 w-4 mr-1" />
                View / Print Payslip
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PayslipCard;
