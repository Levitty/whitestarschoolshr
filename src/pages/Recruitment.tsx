import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Recruitment = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [newJobPosting, setNewJobPosting] = useState({
    title: '',
    department: '',
    description: '',
    qualifications: '',
    salary_range: '',
    application_deadline: '',
    employment_type: 'full-time'
  });

  // Mock data for job postings
  const jobPostings = [
    {
      id: 1,
      title: 'Mathematics Teacher',
      department: 'Mathematics',
      posted_date: '2024-12-15',
      application_deadline: '2025-01-15',
      applications_count: 12,
      status: 'active',
      salary_range: '$45,000 - $55,000'
    },
    {
      id: 2,
      title: 'Science Lab Assistant',
      department: 'Science',
      posted_date: '2024-12-10',
      application_deadline: '2025-01-10',
      applications_count: 8,
      status: 'active',
      salary_range: '$30,000 - $35,000'
    }
  ];

  // Mock data for applications
  const applications = [
    {
      id: 1,
      candidate_name: 'Sarah Johnson',
      position: 'Mathematics Teacher',
      email: 'sarah.j@email.com',
      phone: '+1-555-0123',
      application_date: '2024-12-18',
      status: 'under_review',
      experience: '5 years',
      qualifications: 'M.Ed Mathematics, B.Sc Mathematics'
    },
    {
      id: 2,
      candidate_name: 'Michael Chen',
      position: 'Science Lab Assistant',
      email: 'mike.chen@email.com',
      phone: '+1-555-0124',
      application_date: '2024-12-16',
      status: 'interview_scheduled',
      experience: '3 years',
      qualifications: 'B.Sc Chemistry, Lab Safety Certification'
    }
  ];

  // Mock data for interviews
  const interviews = [
    {
      id: 1,
      candidate_name: 'Michael Chen',
      position: 'Science Lab Assistant',
      interview_date: '2024-12-22T10:00:00',
      interview_type: 'in-person',
      interviewer: 'Dr. Smith',
      status: 'scheduled'
    }
  ];

  const handleCreateJobPosting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newJobPosting.title || !newJobPosting.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual creation logic
    toast({
      title: "Success",
      description: "Job posting created successfully!",
    });

    setNewJobPosting({
      title: '',
      department: '',
      description: '',
      qualifications: '',
      salary_range: '',
      application_deadline: '',
      employment_type: 'full-time'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      draft: 'secondary',
      closed: 'destructive',
      under_review: 'default',
      interview_scheduled: 'default',
      offered: 'default',
      hired: 'default',
      rejected: 'destructive',
      scheduled: 'default',
      completed: 'default'
    } as const;

    const labels = {
      under_review: 'Under Review',
      interview_scheduled: 'Interview Scheduled',
      active: 'Active',
      draft: 'Draft',
      closed: 'Closed',
      offered: 'Offered',
      hired: 'Hired',
      rejected: 'Rejected',
      scheduled: 'Scheduled',
      completed: 'Completed'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruitment Management</h1>
          <p className="text-slate-600 mt-1">Manage job postings, applications, and hiring process</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Postings</p>
                <p className="text-2xl font-bold text-gray-900">{jobPostings.filter(j => j.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                <p className="text-2xl font-bold text-gray-900">18 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Job Postings</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Posting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Job Posting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateJobPosting} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJobPosting.title}
                        onChange={(e) => setNewJobPosting(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Mathematics Teacher"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newJobPosting.department}
                        onValueChange={(value) => setNewJobPosting(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="administration">Administration</SelectItem>
                          <SelectItem value="support">Support Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJobPosting.description}
                      onChange={(e) => setNewJobPosting(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed job description..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualifications">Required Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      value={newJobPosting.qualifications}
                      onChange={(e) => setNewJobPosting(prev => ({ ...prev, qualifications: e.target.value }))}
                      placeholder="List required qualifications..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={newJobPosting.salary_range}
                        onChange={(e) => setNewJobPosting(prev => ({ ...prev, salary_range: e.target.value }))}
                        placeholder="$40,000 - $50,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newJobPosting.application_deadline}
                        onChange={(e) => setNewJobPosting(prev => ({ ...prev, application_deadline: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Job Posting
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {jobPostings.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-600">{job.department} Department</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      <Badge variant="outline">{job.applications_count} applications</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Posted:</span> {job.posted_date}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {job.application_deadline}
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span> {job.salary_range}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Applications</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search applications..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{app.candidate_name}</h3>
                      <p className="text-gray-600">Applied for: {app.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium">Email:</span> {app.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {app.phone}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span> {app.experience}
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span> {app.application_date}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm"><span className="font-medium">Qualifications:</span> {app.qualifications}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Resume</Button>
                    <Button variant="outline" size="sm">Schedule Interview</Button>
                    <Button size="sm">Review Application</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Interview Schedule</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>

          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Card key={interview.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{interview.candidate_name}</h3>
                      <p className="text-gray-600">Position: {interview.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(interview.status)}
                      <Badge variant="outline">{interview.interview_type}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium">Date & Time:</span> 
                      <br />{new Date(interview.interview_date).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Interviewer:</span> {interview.interviewer}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {interview.interview_type}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="outline" size="sm">Add Notes</Button>
                    <Button size="sm">Complete Interview</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <h2 className="text-xl font-semibold">Recruitment Reports & Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Applications Received</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interviews Conducted</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offers Extended</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Positions Filled</span>
                    <span className="font-semibold">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department-wise Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Mathematics</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Science</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Administration</span>
                    <span className="font-semibold">4</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recruitment;
