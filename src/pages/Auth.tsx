import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SignInForm from '@/components/auth/SignInForm';
import StaffSignUpForm from '@/components/auth/StaffSignUpForm';
import TutagoraLogo from '@/components/TutagoraLogo';
import { PLATFORM_BRAND } from '@/constants/branding';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
}

const Auth = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantSlug = searchParams.get('tenant');
  
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);

  // Map custom domains to tenant slugs
  const getDomainTenantSlug = (): string | null => {
    const hostname = window.location.hostname.toLowerCase();
    
    // Map of custom domains to tenant slugs
    const domainToTenant: Record<string, string> = {
      'hr.whitestarschools.com': 'whitestar-schools',
      'www.hr.whitestarschools.com': 'whitestar-schools',
      // Add more domain mappings here as needed
    };
    
    return domainToTenant[hostname] || null;
  };

  // Fetch tenant based on URL param or custom domain
  useEffect(() => {
    const fetchTenant = async () => {
      // First check URL param, then check custom domain
      const slugFromParam = tenantSlug;
      const slugFromDomain = getDomainTenantSlug();
      const effectiveSlug = slugFromParam || slugFromDomain;
      
      console.log('Auth - Domain:', window.location.hostname);
      console.log('Auth - Slug from param:', slugFromParam);
      console.log('Auth - Slug from domain:', slugFromDomain);
      console.log('Auth - Effective slug:', effectiveSlug);
      
      if (!effectiveSlug) {
        setCurrentTenant(null);
        setTenantLoading(false);
        return;
      }
      
      setTenantLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, slug, logo_url, primary_color')
        .eq('slug', effectiveSlug)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching tenant:', error);
      } else if (data) {
        console.log('Auth - Tenant found:', data);
        setCurrentTenant(data);
      } else {
        console.log('Auth - No tenant found for slug:', effectiveSlug);
      }
      setTenantLoading(false);
    };
    
    fetchTenant();
  }, [tenantSlug]);

  useEffect(() => {
    if (user && profile) {
      if (profile.status === 'pending') {
        toast({
          title: "Account Pending Approval",
          description: "Your account is awaiting approval from an administrator.",
          variant: "default"
        });
        return;
      }
      
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        toast({
          title: "Account Inactive",
          description: "Your account has been deactivated. Please contact an administrator.",
          variant: "destructive"
        });
        return;
      }
      
      // Redirect based on role
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header - Show tenant branding if available */}
        <div className="text-center">
          {currentTenant ? (
            <>
              {currentTenant.logo_url ? (
                <img 
                  src={currentTenant.logo_url} 
                  alt={currentTenant.name} 
                  className="h-16 mx-auto mb-4"
                />
              ) : (
                <div className="h-16 w-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {currentTenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-slate-800">{currentTenant.name}</h1>
              <p className="text-slate-600">Staff Portal</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <TutagoraLogo size="lg" />
              </div>
              <p className="text-slate-600">
                {PLATFORM_BRAND.tagline}
              </p>
            </>
          )}
        </div>

        {/* Auth Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {currentTenant ? `Welcome to ${currentTenant.name}` : 'Welcome'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <SignInForm />
              </TabsContent>
              
              <TabsContent value="signup">
                <StaffSignUpForm tenantId={currentTenant?.id} tenantName={currentTenant?.name} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 space-y-3">
          {currentTenant ? (
            <p>Powered by <span className="font-semibold">TUTAGORA</span></p>
          ) : (
            <>
              <p>Secure, compliant, and user-friendly HR management</p>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-slate-500 mb-2">Are you an institution?</p>
                <Link to="/register-institution">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Register Your Institution
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
