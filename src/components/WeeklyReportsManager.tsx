
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWeeklyReports } from '@/hooks/useWeeklyReports';
import { useToast } from '@/hooks/use-toast';
import { FileText, Calendar, Clock, Target, TrendingUp } from 'lucide-react';

const WeeklyReportsManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    weekStartDate: '',
    weekEndDate: '',
    accomplishments: '',
    challenges: '',
    nextWeekGoals: '',
    hoursWorked: '',
    projectsWorkedOn: '',
    meetingsAttended: '',
    trainingCompleted: '',
    keyMetrics: '',
    improvementAreas: '',
    supportNeeded: ''
  });

  const { reports, loading, createReport, submitReport } = useWeeklyReports();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weekStartDate || !formData.accomplishments) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await createReport(
      formData.weekStartDate,
      formData.weekEndDate,
      formData.accomplishments,
      formData.challenges,
      formData.nextWeekGoals,
      formData.hoursWorked ? parseInt(formData.hoursWorked) : undefined
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
        description: "Weekly report created successfully."
      });
      setFormData({
        weekStartDate: '',
        weekEndDate: '',
        accomplishments: '',
        challenges: '',
        nextWeekGoals: '',
        hoursWorked: '',
        projectsWorkedOn: '',
        meetingsAttended: '',
        trainingCompleted: '',
        keyMetrics: '',
        improvementAreas: '',
        supportNeeded: ''
      });
      setIsCreating(false);
    }
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
        description: "Report submitted successfully."
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      submitted: { variant: 'default' as const, label: 'Submitted' },
      reviewed: { variant: 'default' as const, label: 'Reviewed' }
    };

    const config = variants[status as keyof typeof variants] || { variant: 'secondary' as const, label: status };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Weekly Reports</h2>
          <p className="text-slate-600">Submit and manage your weekly activity reports</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <FileText className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Weekly Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weekStartDate">Week Start Date *</Label>
                  <Input
                    id="weekStartDate"
                    type="date"
                    value={formData.weekStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weekStartDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weekEndDate">Week End Date</Label>
                  <Input
                    id="weekEndDate"
                    type="date"
                    value={formData.weekEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weekEndDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accomplishments">Key Accomplishments *</Label>
                <Textarea
                  id="accomplishments"
                  value={formData.accomplishments}
                  onChange={(e) => setFormData(prev => ({ ...prev, accomplishments: e.target.value }))}
                  placeholder="List your major achievements and completed tasks this week..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectsWorkedOn">Projects Worked On</Label>
                <Textarea
                  id="projectsWorkedOn"
                  value={formData.projectsWorkedOn}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectsWorkedOn: e.target.value }))}
                  placeholder="Detail the projects you contributed to this week..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hoursWorked">Hours Worked</Label>
                  <Input
                    id="hoursWorked"
                    type="number"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoursWorked: e.target.value }))}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingsAttended">Meetings Attended</Label>
                  <Input
                    id="meetingsAttended"
                    value={formData.meetingsAttended}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingsAttended: e.target.value }))}
                    placeholder="Team standup, client review, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges & Blockers</Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                  placeholder="Describe any obstacles or difficulties encountered..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyMetrics">Key Metrics & Results</Label>
                <Textarea
                  id="keyMetrics"
                  value={formData.keyMetrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyMetrics: e.target.value }))}
                  placeholder="Quantifiable results, KPIs achieved, performance metrics..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextWeekGoals">Next Week Goals</Label>
                <Textarea
                  id="nextWeekGoals"
                  value={formData.nextWeekGoals}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextWeekGoals: e.target.value }))}
                  placeholder="What do you plan to accomplish next week?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainingCompleted">Training & Development</Label>
                <Textarea
                  id="trainingCompleted"
                  value={formData.trainingCompleted}
                  onChange={(e) => setFormData(prev => ({ ...prev, trainingCompleted: e.target.value }))}
                  placeholder="Courses completed, skills developed, certifications earned..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvementAreas">Areas for Improvement</Label>
                <Textarea
                  id="improvementAreas"
                  value={formData.improvementAreas}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvementAreas: e.target.value }))}
                  placeholder="What areas would you like to improve in?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportNeeded">Support Needed</Label>
                <Textarea
                  id="supportNeeded"
                  value={formData.supportNeeded}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportNeeded: e.target.value }))}
                  placeholder="What support or resources do you need from management?"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  Save Report
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>
                    Week of {new Date(report.week_start_date).toLocaleDateString()}
                    {report.week_end_date && ` - ${new Date(report.week_end_date).toLocaleDateString()}`}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status || 'draft')}
                  {report.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleSubmitReport(report.id)}
                    >
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.hours_worked && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Hours:</strong> {report.hours_worked}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    <strong>Status:</strong> {report.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">
                    <strong>Created:</strong> {new Date(report.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Key Accomplishments</h4>
                <p className="text-sm text-slate-600">{report.accomplishments}</p>
              </div>

              {report.challenges && (
                <div>
                  <h4 className="font-medium mb-2">Challenges</h4>
                  <p className="text-sm text-slate-600">{report.challenges}</p>
                </div>
              )}

              {report.next_week_goals && (
                <div>
                  <h4 className="font-medium mb-2">Next Week Goals</h4>
                  <p className="text-sm text-slate-600">{report.next_week_goals}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-600 mb-4">Create your first weekly report to get started.</p>
            <Button onClick={() => setIsCreating(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyReportsManager;
