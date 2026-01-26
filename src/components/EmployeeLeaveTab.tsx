import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, Heart, BookOpen, Wallet, Download, Printer, FileText } from 'lucide-react';

interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  maternity_leave_total: number;
  maternity_leave_used: number;
  study_leave_total: number;
  study_leave_used: number;
  unpaid_leave_total: number;
  unpaid_leave_used: number;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  reason: string | null;
  created_at: string;
  decision_at: string | null;
  workflow_stage: string | null;
  comments: string | null;
}

interface EmployeeLeaveTabProps {
  employeeId: string;
  profileId?: string;
  employeeName: string;
}

const EmployeeLeaveTab = ({ employeeId, profileId, employeeName }: EmployeeLeaveTabProps) => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const reportRef = useRef<HTMLDivElement>(null);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    fetchData();
  }, [employeeId, profileId, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch leave balance using employee_id (employee_profiles.id)
      const { data: balanceData, error: balanceError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', parseInt(selectedYear))
        .maybeSingle();

      if (balanceError) {
        console.error('Error fetching leave balance:', balanceError);
      }
      setBalance(balanceData);

      // Fetch leave history using profile_id (auth user id)
      if (profileId) {
        const { data: historyData, error: historyError } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('employee_id', profileId)
          .order('created_at', { ascending: false });

        if (historyError) {
          console.error('Error fetching leave history:', historyError);
        }
        setLeaveHistory(historyData || []);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string, workflowStage?: string | null) => {
    const stage = workflowStage || status;
    switch (stage) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending_head':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending_hr':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getStatusLabel = (status: string, workflowStage?: string | null) => {
    const stage = workflowStage || status;
    switch (stage) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending_head': return 'Pending Head Review';
      case 'pending_hr': return 'Pending HR Approval';
      default: return 'Pending';
    }
  };

  const filteredHistory = leaveHistory.filter(leave => {
    const leaveDate = new Date(leave.start_date);
    const leaveYear = leaveDate.getFullYear().toString();
    const leaveMonth = (leaveDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (leaveYear !== selectedYear) return false;
    if (selectedMonth !== 'all' && leaveMonth !== selectedMonth) return false;
    return true;
  });

  const approvedLeaves = filteredHistory.filter(l => l.status === 'approved' || (l as any).workflow_stage === 'approved');

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print the report');
      return;
    }

    const monthLabel = selectedMonth === 'all' 
      ? 'All Months' 
      : months.find(m => m.value === selectedMonth)?.label || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leave Report - ${employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            .header { margin-bottom: 20px; }
            .meta { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .balance-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 30px; }
            .balance-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .balance-value { font-size: 24px; font-weight: bold; color: #333; }
            .balance-label { color: #666; font-size: 12px; }
            .approved { color: green; }
            .rejected { color: red; }
            .pending { color: orange; }
            .summary { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Leave Report</h1>
            <div class="meta">
              <p><strong>Employee:</strong> ${employeeName}</p>
              <p><strong>Period:</strong> ${monthLabel} ${selectedYear}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <h2>Leave Balance (${selectedYear})</h2>
          ${balance ? `
            <div class="balance-grid">
              <div class="balance-card">
                <div class="balance-value">${balance.annual_leave_total - balance.annual_leave_used}</div>
                <div class="balance-label">Annual Leave Remaining</div>
                <div class="balance-label">(${balance.annual_leave_used} of ${balance.annual_leave_total} used)</div>
              </div>
              <div class="balance-card">
                <div class="balance-value">${balance.sick_leave_total - balance.sick_leave_used}</div>
                <div class="balance-label">Sick Leave Remaining</div>
                <div class="balance-label">(${balance.sick_leave_used} of ${balance.sick_leave_total} used)</div>
              </div>
              <div class="balance-card">
                <div class="balance-value">${balance.maternity_leave_total - balance.maternity_leave_used}</div>
                <div class="balance-label">Maternity Leave Remaining</div>
                <div class="balance-label">(${balance.maternity_leave_used} of ${balance.maternity_leave_total} used)</div>
              </div>
              <div class="balance-card">
                <div class="balance-value">${balance.study_leave_total - balance.study_leave_used}</div>
                <div class="balance-label">Study Leave Remaining</div>
                <div class="balance-label">(${balance.study_leave_used} of ${balance.study_leave_total} used)</div>
              </div>
              <div class="balance-card">
                <div class="balance-value">${balance.unpaid_leave_total - balance.unpaid_leave_used}</div>
                <div class="balance-label">Unpaid Leave Remaining</div>
                <div class="balance-label">(${balance.unpaid_leave_used} of ${balance.unpaid_leave_total} used)</div>
              </div>
            </div>
          ` : '<p>No balance data available</p>'}
          
          <h2>Leave History</h2>
          ${filteredHistory.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                ${filteredHistory.map(leave => `
                  <tr>
                    <td>${leave.leave_type}</td>
                    <td>${new Date(leave.start_date).toLocaleDateString()}</td>
                    <td>${new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>${leave.days_requested}</td>
                    <td class="${leave.status === 'approved' ? 'approved' : leave.status === 'rejected' ? 'rejected' : 'pending'}">${getStatusLabel(leave.status, leave.workflow_stage)}</td>
                    <td>${leave.reason || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <strong>Summary:</strong> 
              Total leaves in period: ${filteredHistory.length} | 
              Approved: ${approvedLeaves.length} | 
              Total days taken: ${approvedLeaves.reduce((sum, l) => sum + l.days_requested, 0)}
            </div>
          ` : '<p>No leave records found for this period.</p>'}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const leaveTypes = balance ? [
    {
      type: 'Annual Leave',
      total: balance.annual_leave_total,
      used: balance.annual_leave_used,
      remaining: balance.annual_leave_total - balance.annual_leave_used,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'Sick Leave',
      total: balance.sick_leave_total,
      used: balance.sick_leave_used,
      remaining: balance.sick_leave_total - balance.sick_leave_used,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      type: 'Maternity Leave',
      total: balance.maternity_leave_total,
      used: balance.maternity_leave_used,
      remaining: balance.maternity_leave_total - balance.maternity_leave_used,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      type: 'Study Leave',
      total: balance.study_leave_total,
      used: balance.study_leave_used,
      remaining: balance.study_leave_total - balance.study_leave_used,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      type: 'Unpaid Leave',
      total: balance.unpaid_leave_total,
      used: balance.unpaid_leave_used,
      remaining: balance.unpaid_leave_total - balance.unpaid_leave_used,
      icon: Wallet,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave Information
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Leave Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {balance ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {leaveTypes.map((leave) => {
                const Icon = leave.icon;
                const percentageUsed = leave.total > 0 ? (leave.used / leave.total) * 100 : 0;
                
                return (
                  <div key={leave.type} className={`p-4 rounded-lg ${leave.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-6 w-6 ${leave.color}`} />
                      <span className={`text-2xl font-bold ${leave.color}`}>
                        {leave.remaining}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{leave.type}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {leave.used} used of {leave.total} days
                    </p>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${leave.color.replace('text', 'bg')}`}
                        style={{ width: `${percentageUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No leave balance found for {selectedYear}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No leave records found for the selected period
            </p>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((leave) => (
                <div key={leave.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium capitalize">{leave.leave_type} Leave</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({leave.days_requested} days)
                      </p>
                    </div>
                    <Badge className={getStatusColor(leave.status, leave.workflow_stage)}>
                      {getStatusLabel(leave.status, leave.workflow_stage)}
                    </Badge>
                  </div>
                  {leave.reason && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </p>
                  )}
                  {leave.comments && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Comments:</span> {leave.comments}
                    </p>
                  )}
                </div>
              ))}
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Summary:</strong> {filteredHistory.length} leave request(s) | 
                  {approvedLeaves.length} approved | 
                  {approvedLeaves.reduce((sum, l) => sum + l.days_requested, 0)} total days taken
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLeaveTab;
