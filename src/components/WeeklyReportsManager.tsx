
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWeeklyReports } from '@/hooks/useWeeklyReports';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Calendar, Clock, CheckCircle } from 'lucide-react';

const WeeklyReportsManager = () => {
  const { reports, loading, createReport, submitReport } = useWeeklyReports();
  const [newReport, setNewReport] = useState({
    week_start_date: '',
    week_end_date: '',
    accomplishments: '',
    challenges: '',
    next_week_goals: '',
    hours_worked: ''
  });
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.week_start_date || !newReport.week_end_date || !newReport.accomplishments) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const { error } = await createReport(
      newReport.week_start_date,
      newReport.week_end_date,
      newReport.accomplishments,
      newReport.challenges || undefined,
      newReport.next_week_goals || undefined,
      newReport.hours_worked ? parseInt(newReport.hours_worked) : undefined
    );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create weekly report.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Weekly report created successfully!"
      });
      setNewReport({
        week_start_date: '',
        week_end_date: '',
        accomplishments: '',
        challenges: '',
        next_week_goals: '',
        hours_worked: ''
      });
      setOpen(false);
    }
    setSubmitting(false);
  };

  const handleSubmitReport = async (reportId: string) => {
    const { error } = await submitReport(reportId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Report submitted successfully!"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'submitted':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading weekly reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Weekly Reports</h2>
          <p className="text-slate-600">Track weekly accomplishments and goals</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Weekly Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="week_start_date">Week Start Date *</Label>
                  <Input
                    id="week_start_date"
                    type="date"
                    value={newReport.week_start_date}
                    onChange={(e) => setNewReport(prev => ({ ...prev, week_start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="week_end_date">Week End Date *</Label>
                  <Input
                    id="week_end_date"
                    type="date"
                    value={newReport.week_end_date}
                    onChange={(e) => setNewReport(prev => ({ ...prev, week_end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hours_worked">Hours Worked</Label>
                <Input
                  id="hours_worked"
                  type="number"
                  value={newReport.hours_worked}
                  onChange={(e) => setNewReport(prev => ({ ...prev, hours_worked: e.target.value }))}
                  placeholder="40"
                />
              </div>

              <div>
                <Label htmlFor="accomplishments">Accomplishments *</Label>
                <Textarea
                  id="accomplishments"
                  value={newReport.accomplishments}
                  onChange={(e) => setNewReport(prev => ({ ...prev, accomplishments: e.target.value }))}
                  placeholder="What did you accomplish this week?"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="challenges">Challenges</Label>
                <Textarea
                  id="challenges"
                  value={newReport.challenges}
                  onChange={(e) => setNewReport(prev => ({ ...prev, challenges: e.target.value }))}
                  placeholder="What challenges did you face?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="next_week_goals">Next Week Goals</Label>
                <Textarea
                  id="next_week_goals"
                  value={newReport.next_week_goals}
                  onChange={(e) => setNewReport(prev => ({ ...prev, next_week_goals: e.target.value }))}
                  placeholder="What are your goals for next week?"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Report'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {new Date(report.week_start_date).toLocaleDateString()} - {new Date(report.week_end_date).toLocaleDateString()}
                  </span>
                  <Badge variant={getStatusColor(report.status || 'draft')}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(report.status || 'draft')}
                      {report.status || 'draft'}
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {report.hours_worked && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {report.hours_worked}h
                    </div>
                  )}
                  {report.status === 'draft' && (
                    <Button size="sm" onClick={() => handleSubmitReport(report.id)}>
                      Submit
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Accomplishments</h4>
                  <p className="text-gray-600">{report.accomplishments}</p>
                </div>

                {report.challenges && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Challenges</h4>
                    <p className="text-gray-600">{report.challenges}</p>
                  </div>
                )}

                {report.next_week_goals && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Next Week Goals</h4>
                    <p className="text-gray-600">{report.next_week_goals}</p>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Created: {new Date(report.created_at || '').toLocaleDateString()}</span>
                  {report.submitted_at && (
                    <span>Submitted: {new Date(report.submitted_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports</h3>
            <p className="text-gray-600">No weekly reports have been created yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyReportsManager;
