
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Clock, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import logo from '@/assets/whitestar-logo.png';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  created_at: string;
}

const JobsBoard = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_listings')
          .select('id, title, department, location, employment_type, created_at')
          .eq('status', 'Open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading available positions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Jobs Board - Whitestar Schools HR</title>
        <meta name="description" content="Browse and apply for open positions at Whitestar Schools" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <img 
            src={logo} 
            alt="Whitestar Group of Schools" 
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-primary mb-4">Jobs Board</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover exciting career opportunities and join our growing team.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No Open Positions Currently
            </h2>
            <p className="text-muted-foreground">
              Check back soon for new opportunities or contact us directly.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-xl transition-all hover:scale-105 border-primary/20 bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-primary mb-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {job.employment_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={`/job-details?id=${job.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default JobsBoard;
