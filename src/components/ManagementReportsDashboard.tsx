import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useManagementReports, ManagementReport } from '@/hooks/useManagementReports';
import { 
  FileBarChart, Users, Calendar, BarChart3, Ticket, Briefcase, 
  Send, Clock, RefreshCw, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, Mail, AlertTriangle, UserPlus, UserMinus
} from 'lucide-react';
import { useState } from 'react';

const MetricRow = ({ label, value, color }: { label: string; value: number; color?: string }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-semibold ${color || ''}`}>{value}</span>
  </div>
);

const TrendBadge = ({ current, previous }: { current: number; previous: number }) => {
  const diff = current - previous;
  if (diff === 0) return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="h-3 w-3" /> 0</span>;
  if (diff > 0) return <span className="text-xs text-green-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +{diff}</span>;
  return <span className="text-xs text-red-600 flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> {diff}</span>;
};

const ReportCard = ({ report }: { report: ManagementReport }) => {
  const [expanded, setExpanded] = useState(false);
  const data = report.report_data as any;
  const trends = data?.trends;

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

      <CardContent className="pt-0">
        {/* Summary cards with trends */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{report.total_headcount}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Headcount</p>
            {trends?.headcount && <div className="mt-1 flex justify-center"><TrendBadge current={trends.headcount.current} previous={trends.headcount.previous} /></div>}
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
            {trends?.tickets && <div className="mt-1 flex justify-center"><TrendBadge current={trends.tickets.current} previous={trends.tickets.previous} /></div>}
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Briefcase className="h-4 w-4 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-bold">{report.open_positions}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Open Roles</p>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="space-y-6 pt-3 border-t">
            {/* Week-over-week trends */}
            {trends && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Week-over-Week Trends
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Headcount', ...trends.headcount },
                    { label: 'Leave Requests', ...trends.leaveSubmitted },
                    { label: 'Leave Days', ...trends.leaveDays },
                    { label: 'New Tickets', ...trends.tickets },
                    { label: 'Applications', ...trends.applications },
                  ].map((t, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-muted-foreground">{t.label}</p>
                      <p className="text-lg font-bold">{t.current}</p>
                      <TrendBadge current={t.current} previous={t.previous} />
                      <p className="text-[10px] text-muted-foreground">prev: {t.previous}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HR Overview + New Hires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" /> HR Overview
                </h4>
                <MetricRow label="New Hires" value={report.new_hires} color="text-green-600" />
                <MetricRow label="Terminations" value={report.terminations} color="text-red-600" />
                <MetricRow label="Active Clearances" value={report.active_clearances} />
                {data?.hr?.expiringContracts?.length > 0 && (
                  <MetricRow label="Expiring Contracts (30d)" value={data.hr.expiringContracts.length} color="text-amber-600" />
                )}
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
            </div>

            {/* New Hires Detail */}
            {data?.hr?.newHiresList?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-600" /> New Hires This Week
                </h4>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Name</th>
                        <th className="text-left px-3 py-2 font-medium">Department</th>
                        <th className="text-left px-3 py-2 font-medium">Position</th>
                        <th className="text-left px-3 py-2 font-medium">Hire Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hr.newHiresList.map((h: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{h.first_name} {h.last_name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{h.department}</td>
                          <td className="px-3 py-2">{h.position}</td>
                          <td className="px-3 py-2 text-muted-foreground">{h.hire_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expiring Contracts */}
            {data?.hr?.expiringContracts?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Contracts Expiring Within 30 Days
                </h4>
                <div className="rounded-lg border border-amber-200 overflow-hidden bg-amber-50/50 dark:bg-amber-950/20">
                  <table className="w-full text-sm">
                    <thead className="bg-amber-100/50 dark:bg-amber-900/30">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Name</th>
                        <th className="text-left px-3 py-2 font-medium">Department</th>
                        <th className="text-left px-3 py-2 font-medium">Position</th>
                        <th className="text-left px-3 py-2 font-medium">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hr.expiringContracts.map((c: any, i: number) => (
                        <tr key={i} className="border-t border-amber-200">
                          <td className="px-3 py-2">{c.first_name} {c.last_name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{c.department}</td>
                          <td className="px-3 py-2">{c.position}</td>
                          <td className="px-3 py-2 font-semibold text-destructive">{c.contract_end_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leave By Type */}
            {data?.leave?.byType && Object.keys(data.leave.byType).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" /> Leave Breakdown by Type
                </h4>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Leave Type</th>
                        <th className="text-right px-3 py-2 font-medium">Requests</th>
                        <th className="text-right px-3 py-2 font-medium">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.leave.byType).map(([type, val]: [string, any], i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{type}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">{val.count}</td>
                          <td className="px-3 py-2 text-right font-semibold">{val.days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Employees On Leave */}
            {data?.leave?.onLeaveThisWeek?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <UserMinus className="h-4 w-4 text-blue-500" /> Employees On Leave This Week ({data.leave.onLeaveThisWeek.length})
                </h4>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Name</th>
                        <th className="text-left px-3 py-2 font-medium">Department</th>
                        <th className="text-left px-3 py-2 font-medium">Type</th>
                        <th className="text-left px-3 py-2 font-medium">Period</th>
                        <th className="text-right px-3 py-2 font-medium">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.leave.onLeaveThisWeek.map((e: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{e.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{e.department}</td>
                          <td className="px-3 py-2">{e.leave_type}</td>
                          <td className="px-3 py-2 text-muted-foreground">{e.start_date} → {e.end_date}</td>
                          <td className="px-3 py-2 text-right font-semibold">{e.days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PIP Details */}
            {data?.performance?.pipDetails?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Employees on Performance Improvement Plans
                </h4>
                <div className="rounded-lg border border-red-200 overflow-hidden bg-red-50/50 dark:bg-red-950/20">
                  <table className="w-full text-sm">
                    <thead className="bg-red-100/50 dark:bg-red-900/30">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Name</th>
                        <th className="text-left px-3 py-2 font-medium">Department</th>
                        <th className="text-left px-3 py-2 font-medium">Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.performance.pipDetails.map((p: any, i: number) => (
                        <tr key={i} className="border-t border-red-200">
                          <td className="px-3 py-2">{p.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{p.department}</td>
                          <td className="px-3 py-2 text-muted-foreground">{p.start_date} → {p.end_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Email recipients */}
            {report.email_recipients && report.email_recipients.length > 0 && (
              <div className="pt-2 border-t">
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
            Detailed weekly HR overview with employee-level data, leave breakdowns, and trends.
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
