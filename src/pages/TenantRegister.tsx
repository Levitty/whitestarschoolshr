import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS } from '@/types/tenant';
import TutagoraLogo from '@/components/TutagoraLogo';
import { PLATFORM_BRAND } from '@/constants/branding';

const TenantRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    // Institution info
    institutionName: '',
    slug: '',
    subscriptionTier: 'trial',
    // Admin info
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInstitutionNameChange = (value: string) => {
    setFormData({
      ...formData,
      institutionName: value,
      slug: generateSlug(value)
    });
  };

  const validateStep1 = () => {
    if (!formData.institutionName.trim()) {
      toast.error('Please enter institution name');
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error('Please enter a valid URL slug');
      return false;
    }
    if (formData.slug.length < 3) {
      toast.error('Slug must be at least 3 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.adminName.trim()) {
      toast.error('Please enter admin name');
      return false;
    }
    if (!formData.adminEmail.trim()) {
      toast.error('Please enter admin email');
      return false;
    }
    if (!formData.adminPassword) {
      toast.error('Please enter password');
      return false;
    }
    if (formData.adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Check if slug is available
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', formData.slug)
        .maybeSingle();

      if (existingTenant) {
        toast.error('This URL slug is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      // Create the tenant first
      const tierConfig = SUBSCRIPTION_TIERS[formData.subscriptionTier as keyof typeof SUBSCRIPTION_TIERS];
      
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: formData.institutionName,
          slug: formData.slug,
          subscription_tier: formData.subscriptionTier,
          max_employees: tierConfig?.maxEmployees || 10,
          is_active: true
        })
        .select()
        .single();

      if (tenantError) {
        throw tenantError;
      }

      // Create the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: formData.adminName,
            first_name: formData.adminName.split(' ')[0],
            last_name: formData.adminName.split(' ').slice(1).join(' ') || '',
            role: 'superadmin',
            tenant_id: tenant.id
          }
        }
      });

      if (authError) {
        // Rollback tenant creation
        await supabase.from('tenants').delete().eq('id', tenant.id);
        throw authError;
      }

      // Link user to tenant
      if (authData.user) {
        await supabase.from('tenant_users').insert({
          tenant_id: tenant.id,
          user_id: authData.user.id,
          is_tenant_admin: true
        });

        // Update the profile with tenant_id
        await supabase
          .from('profiles')
          .update({ tenant_id: tenant.id })
          .eq('id', authData.user.id);
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a confirmation email to <strong>{formData.adminEmail}</strong>. 
              Please verify your email to activate your account.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <TutagoraLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Register Your Institution</h1>
          <p className="text-slate-400">{PLATFORM_BRAND.tagline}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-slate-200'}`}>
                  1
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-slate-200'}`}>
                  2
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Step {step} of 2</span>
            </div>
            <CardTitle>
              {step === 1 ? 'Institution Details' : 'Admin Account'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Tell us about your institution' 
                : 'Create your admin account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="institutionName"
                      placeholder="e.g., Greenwood Academy"
                      className="pl-10"
                      value={formData.institutionName}
                      onChange={(e) => handleInstitutionNameChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="greenwood-academy"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your portal will be at: app.yourdomain.com/{formData.slug || 'your-slug'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Subscription Plan</Label>
                  <Select 
                    value={formData.subscriptionTier}
                    onValueChange={(value) => setFormData({ ...formData, subscriptionTier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">
                        <div className="flex items-center justify-between w-full">
                          <span>Trial - Free for 14 days</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="basic">Basic - $29/month (25 employees)</SelectItem>
                      <SelectItem value="professional">Professional - $79/month (100 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise - Contact us</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full mt-6" 
                  onClick={() => validateStep1() && setStep(2)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminName"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@institution.com"
                      className="pl-10"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantRegister;
