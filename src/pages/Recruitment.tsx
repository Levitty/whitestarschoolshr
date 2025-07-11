
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Users, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJobListings } from '@/hooks/useJobListings';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useInterviews } from '@/hooks/useInterviews';
import { JobPostingForm } from '@/components/JobPostingForm';
import { ApplicationsList } from '@/components/ApplicationsList';
import { InterviewsList } from '@/components/InterviewsList';
import { RecruitmentReports } from '@/components/RecruitmentReports';
import RecruitmentAssessments from '@/components/RecruitmentAssessments';

const Recruitment = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('postings');
  const { jobListings, loading: jobsLoading, updateJobListing } = useJobListings();
  const { applications } = useJobApplications();
  const { interviews } = useInterviews();

  const handleCopyJobLink = async (jobId: string, jobTitle: string) => {
    const jobUrl = `${window.location.origin}/job-details?id=${jobId}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      toast({
        title: "Link Copied!",
        description: `Shareable link for "${jobTitle}" has been copied to clipboard.`
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Open': 'default',
      'Closed': 'destructive',
      'New': 'secondary',
      'Interview': 'default',
      'Rejected': 'destructive',
      'Hired': 'default',
      'Scheduled': 'default',
      'Completed': 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const stats = {
    activeJobs: jobListings?.filter(job => job.status === 'Open').length || 0,
    totalApplications: applications?.length || 0,
    scheduledInterviews: interviews?.filter(interview => interview.status === 'Scheduled').length || 0,
    hiredCandidates: applications?.filter(app => app.status === 'Hired').length || 0
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
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledInterviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hiredCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="postings">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="postings" className="space-y-6">
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
                <JobPostingForm onSuccess={() => window.location.reload()} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {jobsLoading ? (
              <div>Loading job postings...</div>
            ) : (
              jobListings?.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-gray-600">{job.department} • {job.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Badge variant="outline">{job.employment_type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateJobListing(job.id, { 
                          status: job.status === 'Open' ? 'Closed' : 'Open' 
                        })}
                      >
                        {job.status === 'Open' ? 'Close' : 'Reopen'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyJobLink(job.id, job.title)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <ApplicationsList />
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <InterviewsList />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <RecruitmentAssessments />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <RecruitmentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recruitment;
