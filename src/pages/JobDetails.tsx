
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Building, Clock, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  department: string;
  location: string;
  employment_type: string;
  created_at: string;
}

const JobDetails = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get job ID from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get('id');

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', jobId)
          .eq('status', 'Open')
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleShareJob = async () => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link Copied!",
        description: "Job link has been copied to clipboard."
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">
              Job Not Found
            </h1>
            <p className="text-gray-500 mb-6">
              This position may have been filled or is no longer available.
            </p>
            <Link to="/jobs-board">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs Board
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{job.title} - {tenant?.name || 'Careers'}</title>
        <meta name="description" content={`Apply for ${job.title} position at ${job.department}, ${job.location}`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/jobs-board">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs Board
            </Button>
          </Link>
          <Button variant="outline" onClick={handleShareJob}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Job
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  {job.title}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <Badge variant="secondary" className="text-sm">
                      {job.employment_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Job Description</h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            {job.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Requirements</h2>
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={`/apply?id=${job.id}`} className="flex-1">
                  <Button size="lg" className="w-full text-lg">
                    Apply Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={handleShareJob}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Job
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};

export default JobDetails;
