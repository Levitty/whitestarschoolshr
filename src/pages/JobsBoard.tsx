
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Clock, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useSearchParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  created_at: string;
}

interface TenantInfo {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
}

const JobsBoard = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardTenant, setBoardTenant] = useState<TenantInfo | null>(null);
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const resolveTenant = async () => {
      // Priority: 1) query param ?tenant=slug, 2) logged-in tenant context
      const slugParam = searchParams.get('tenant');

      if (slugParam) {
        const { data } = await supabase
          .from('tenants')
          .select('id, name, logo_url, slug')
          .eq('slug', slugParam)
          .single();
        if (data) {
          setBoardTenant(data);
          return data.id;
        }
      }

      if (tenant) {
        setBoardTenant({
          id: tenant.id,
          name: tenant.name,
          logo_url: tenant.logo_url || null,
          slug: tenant.slug || '',
        });
        return tenant.id;
      }

      return null;
    };

    const fetchJobs = async () => {
      try {
        const tenantId = await resolveTenant();

        let query = supabase
          .from('job_listings')
          .select('id, title, department, location, employment_type, created_at')
          .eq('status', 'Open')
          .order('created_at', { ascending: false });

        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [tenant, searchParams]);

  const tenantName = boardTenant?.name || tenant?.name || 'Our Organization';
  const tenantLogo = boardTenant?.logo_url || tenant?.logo_url;

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
        <title>Jobs Board - {tenantName}</title>
        <meta name="description" content={`Browse and apply for open positions at ${tenantName}. Join our growing team.`} />

        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={`${tenantName} Jobs Board`} />
        <meta property="og:description" content={`Browse and apply for open positions at ${tenantName}. Join our growing team.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        {tenantLogo && <meta property="og:image" content={tenantLogo} />}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${tenantName} Jobs Board`} />
        <meta name="twitter:description" content={`Browse and apply for open positions at ${tenantName}. Join our growing team.`} />
        {tenantLogo && <meta name="twitter:image" content={tenantLogo} />}
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          {tenantLogo ? (
            <img
              src={tenantLogo}
              alt={tenantName}
              className="h-32 mx-auto mb-6"
            />
          ) : (
            <div className="h-32 w-32 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">{tenantName.charAt(0)}</span>
            </div>
          )}
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
