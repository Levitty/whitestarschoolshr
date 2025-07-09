
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Building, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: string;
  created_at: string;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', id)
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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading job details...</div>
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
            <Link to="/jobs">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-gray-600">
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
                      <span>{job.employment_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {job.employment_type}
                </Badge>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={`/apply/${job.id}`} className="flex-1">
                  <Button size="lg" className="w-full">
                    Apply for this Position
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={() => window.print()}>
                  Print Job Description
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetail;
