
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { jobListings, loading: jobsLoading, updateJobListing } = useJobListings();
  const { applications } = useJobApplications();
  const { interviews } = useInterviews();

  const handleJobPostingSuccess = () => {
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Job posting created successfully!"
    });
  };

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
          <h1 className="text-2xl font-bold text-foreground">Recruitment Management</h1>
          <p className="text-muted-foreground mt-1">Manage job postings, applications, and hiring process</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-foreground">{stats.scheduledInterviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold text-foreground">{stats.hiredCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="postings" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Job Postings</TabsTrigger>
          <TabsTrigger value="applications" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Applications</TabsTrigger>
          <TabsTrigger value="interviews" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Interviews</TabsTrigger>
          <TabsTrigger value="assessments" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Assessments</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="postings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Job Postings</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <JobPostingForm onSuccess={handleJobPostingSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {jobsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading job postings...</p>
              </div>
            ) : jobListings?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No job postings found. Create your first job posting!</p>
              </div>
            ) : (
              jobListings?.map((job) => (
                <Card key={job.id} className="border-0 shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        <p className="text-muted-foreground">{job.department} • {job.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Badge variant="outline">{job.employment_type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
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
                        className="text-primary hover:text-primary"
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
