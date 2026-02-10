import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useManagementReports, ManagementReport } from '@/hooks/useManagementReports';
import { 
  FileBarChart, Users, Calendar, BarChart3, Ticket, Briefcase, 
  Send, Clock, RefreshCw, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, Mail
} from 'lucide-react';
import { useState } from 'react';

const MetricRow = ({ label, value, color }: { label: string; value: number; color?: string }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-semibold ${color || ''}`}>{value}</span>
  </div>
);

const ReportCard = ({ report }: { report: ManagementReport }) => {
  const [expanded, setExpanded] = useState(false);

  const periodLabel = `${new Date(report.report_period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(report.report_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileBarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Week of {periodLabel}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Generated {new Date(report.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report.email_sent ? (
              <Badge variant="default" className="gap-1">
                <Mail className="h-3 w-3" /> Sent
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" /> Not Sent
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Summary cards always visible */}
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{report.total_headcount}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Headcount</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold">{report.leave_requests_pending}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Leave Pending</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{report.evaluations_completed}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Evals Done</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Ticket className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{report.tickets_pending}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Tickets Open</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Briefcase className="h-4 w-4 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-bold">{report.open_positions}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Open Roles</p>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> HR Overview
              </h4>
              <MetricRow label="New Hires" value={report.new_hires} color="text-green-600" />
              <MetricRow label="Terminations" value={report.terminations} color="text-red-600" />
              <MetricRow label="Active Clearances" value={report.active_clearances} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Leave & Attendance
              </h4>
              <MetricRow label="Submitted" value={report.leave_requests_submitted} />
              <MetricRow label="Approved" value={report.leave_requests_approved} color="text-green-600" />
              <MetricRow label="Rejected" value={report.leave_requests_rejected} color="text-red-600" />
              <MetricRow label="Total Days Taken" value={report.total_leave_days_taken} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Recruitment
              </h4>
              <MetricRow label="New Applications" value={report.new_applications} />
              <MetricRow label="Interviews Scheduled" value={report.interviews_scheduled} />
              <MetricRow label="Active PIPs" value={report.active_pips} color="text-amber-600" />
            </div>

            {report.email_recipients && report.email_recipients.length > 0 && (
              <div className="md:col-span-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 inline mr-1" />
                  Emailed to: {report.email_recipients.join(', ')}
                  {report.email_sent_at && ` at ${new Date(report.email_sent_at).toLocaleString()}`}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ManagementReportsDashboard = () => {
  const { reports, loading, generating, generateReport } = useManagementReports();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Management Reports</h2>
          <p className="text-muted-foreground text-sm">
            Auto-generated every Friday with full HR overview. Emailed to all admins.
          </p>
        </div>
        <Button onClick={generateReport} disabled={generating}>
          {generating ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {generating ? 'Generating...' : 'Generate Now'}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileBarChart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Reports are generated automatically every Friday evening, or you can generate one now.
            </p>
            <Button onClick={generateReport} disabled={generating}>
              <Send className="mr-2 h-4 w-4" />
              Generate First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagementReportsDashboard;
