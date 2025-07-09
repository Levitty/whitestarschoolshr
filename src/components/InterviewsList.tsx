
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, User } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { useJobApplications } from '@/hooks/useJobApplications';

export const InterviewsList = () => {
  const { interviews, loading, createInterview, updateInterview } = useInterviews();
  const { applications } = useJobApplications();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    application_id: '',
    interview_date: '',
    interviewer_name: '',
    interview_type: 'Phone' as 'Phone' | 'Physical' | 'Online'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInterview({
        ...formData,
        interview_date: new Date(formData.interview_date).toISOString()
      });
      setShowForm(false);
      setFormData({
        application_id: '',
        interview_date: '',
        interviewer_name: '',
        interview_type: 'Phone'
      });
    } catch (error) {
      console.error('Error creating interview:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Scheduled': 'default',
      'Completed': 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading interviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Interview Schedule</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="application">Application</Label>
                <Select 
                  value={formData.application_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, application_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications?.filter(app => app.status === 'Interview').map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.candidate_name} - {app.job_listings?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interview_date">Interview Date & Time</Label>
                <Input
                  id="interview_date"
                  type="datetime-local"
                  value={formData.interview_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, interview_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interviewer_name">Interviewer Name</Label>
                <Input
                  id="interviewer_name"
                  value={formData.interviewer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, interviewer_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interview_type">Interview Type</Label>
                <Select 
                  value={formData.interview_type} 
                  onValueChange={(value: 'Phone' | 'Physical' | 'Online') => 
                    setFormData(prev => ({ ...prev, interview_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Schedule Interview</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {interviews?.map((interview) => (
          <Card key={interview.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {interview.job_applications?.candidate_name}
                  </h3>
                  <p className="text-gray-600">
                    Position: {interview.job_applications?.job_listings?.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(interview.status)}
                  <Badge variant="outline">{interview.interview_type}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{new Date(interview.interview_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{interview.interviewer_name}</span>
                </div>
                <div>
                  <span className="font-medium">Type:</span> {interview.interview_type}
                </div>
              </div>

              {interview.feedback && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{interview.feedback}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">Reschedule</Button>
                <Button variant="outline" size="sm">Add Feedback</Button>
                {interview.status === 'Scheduled' && (
                  <Button 
                    size="sm"
                    onClick={() => updateInterview(interview.id, { status: 'Completed' })}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
