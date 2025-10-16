
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Filter, Users, FileText, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  note: string | null;
  status: string;
  applied_at: string;
  cv_url: string | null;
  job_id: string | null;
  job_listings?: {
    title: string;
    department: string;
  };
}

interface JobListing {
  id: string;
  title: string;
  department: string;
}

const Applications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const [cvPreviewName, setCvPreviewName] = useState<string>('');

  useEffect(() => {
    fetchApplications();
    fetchJobListings();
  }, []);

  useEffect(() => {
    if (selectedJob === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.job_id === selectedJob));
    }
  }, [applications, selectedJob]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_listings (
            title,
            department,
            status
          )
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      
      // Filter out applications for closed jobs
      const openJobApplications = (data || []).filter(
        app => app.job_listings?.status === 'Open'
      );
      
      setApplications(openJobApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobListings = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('id, title, department')
        .order('title');

      if (error) throw error;
      setJobListings(data || []);
    } catch (error) {
      console.error('Error fetching job listings:', error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId);
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update application status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const viewCV = async (cvUrl: string, candidateName: string) => {
    try {
      const urlParts = cvUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'cv-uploads');
      if (bucketIndex === -1) {
        throw new Error('Invalid CV URL format');
      }
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      const { data, error } = await supabase.storage
        .from('cv-uploads')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        setCvPreviewUrl(data.signedUrl);
        setCvPreviewName(candidateName);
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      toast({
        title: "Error",
        description: "Failed to load CV preview",
        variant: "destructive"
      });
    }
  };

  const downloadCV = async (cvUrl: string, candidateName: string) => {
    try {
      const urlParts = cvUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'cv-uploads');
      if (bucketIndex === -1) {
        throw new Error('Invalid CV URL format');
      }
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      const { data, error } = await supabase.storage
        .from('cv-uploads')
        .download(filePath);

      if (error) {
        console.error('Storage download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No file data received');
      }

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: `CV for ${candidateName} has been downloaded successfully.`
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download CV. The file may not exist or access may be restricted.",
        variant: "destructive"
      });
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast({
        title: "Deleted",
        description: "Application has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete application",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'New': 'secondary',
      'Interview': 'default',
      'Rejected': 'destructive',
      'Hired': 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'text-blue-600';
      case 'Interview': return 'text-yellow-600';
      case 'Rejected': return 'text-red-600';
      case 'Hired': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Manage job applications and candidate status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
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
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'New').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'Interview').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'Hired').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Applications
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobListings.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.candidate_name}</div>
                        <div className="text-sm text-gray-500">{application.candidate_email}</div>
                        {application.note && (
                          <div className="text-sm text-gray-600 mt-1 max-w-xs truncate">
                            Note: {application.note}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {application.job_listings ? (
                        <div>
                          <div className="font-medium">{application.job_listings.title}</div>
                          <div className="text-sm text-gray-500">{application.job_listings.department}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Job not found</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(application.applied_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      {application.cv_url ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewCV(application.cv_url!, application.candidate_name)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCV(application.cv_url!, application.candidate_name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No CV</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={application.status}
                          onValueChange={(value) => updateApplicationStatus(application.id, value)}
                          disabled={updatingStatus === application.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApplication(application.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No applications found</p>
                {selectedJob !== 'all' && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJob('all')}
                    className="mt-2"
                  >
                    Show All Applications
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CV Preview Dialog */}
      <Dialog open={!!cvPreviewUrl} onOpenChange={(open) => !open && setCvPreviewUrl(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>{cvPreviewName} - CV</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = cvPreviewUrl!;
                  a.download = `${cvPreviewName}_CV.pdf`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogHeader>
          <div className="w-full h-[calc(90vh-100px)] bg-gray-100">
            {cvPreviewUrl && (
              <iframe
                src={cvPreviewUrl}
                className="w-full h-full border-0"
                title="CV Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
