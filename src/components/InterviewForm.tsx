
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterviews } from '@/hooks/useInterviews';
import { useToast } from '@/hooks/use-toast';
import { UserCheck } from 'lucide-react';

interface InterviewFormProps {
  onSuccess?: () => void;
}

const InterviewForm = ({ onSuccess }: InterviewFormProps) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [position, setPosition] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createInterview } = useInterviews();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !position || !interviewDate || !interviewType) return;

    setSubmitting(true);
    const { error } = await createInterview(
      candidateName,
      candidateEmail,
      position,
      interviewDate,
      interviewType
    );

    if (error) {
      toast({
        title: "Interview Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Interview Scheduled",
        description: "The interview has been scheduled successfully."
      });
      setCandidateName('');
      setCandidateEmail('');
      setPosition('');
      setInterviewDate('');
      setInterviewType('');
      onSuccess?.();
    }
    setSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Schedule Interview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidateEmail">Email</Label>
            <Input
              id="candidateEmail"
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="candidate@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Job position"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewDate">Interview Date & Time</Label>
            <Input
              id="interviewDate"
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewType">Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={submitting || !candidateName || !position || !interviewDate || !interviewType}>
            {submitting ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InterviewForm;
