import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSaasAdmin, PlatformStats } from '@/hooks/useSaasAdmin';
import { TenantWithStats, SUBSCRIPTION_TIERS } from '@/types/tenant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  Plus, 
  Settings,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import new components
import SaasAdminHeader from '@/components/saas-admin/SaasAdminHeader';
import TenantsTable from '@/components/saas-admin/TenantsTable';
import TenantDetailsDialog from '@/components/saas-admin/TenantDetailsDialog';
import ManageSubscriptionDialog from '@/components/saas-admin/ManageSubscriptionDialog';
import RecentActivityLog, { ActivityItem } from '@/components/saas-admin/RecentActivityLog';
import SystemHealthBadge from '@/components/saas-admin/SystemHealthBadge';

const SaasAdmin = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { 
    isSaasAdmin, 
    loading: saasLoading, 
    fetchTenants, 
    createTenant, 
    updateTenant,
    toggleTenantActive, 
    getPlatformStats,
    getRecentActivity 
  } = useSaasAdmin();
  
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalEmployees: 0,
    totalUsers: 0,
    trialsEndingSoon: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(null);
  
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    subscription_tier: 'trial',
    max_employees: 50
  });
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!saasLoading && !isSaasAdmin) {
      toast.error('Access denied. SaaS admin privileges required.');
      navigate('/dashboard');
      return;
    }

    if (isSaasAdmin) {
      loadData();
      loadActivities();
    }
  }, [user, authLoading, isSaasAdmin, saasLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, statsData] = await Promise.all([
        fetchTenants(),
        getPlatformStats()
      ]);
      setTenants(tenantsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    setActivitiesLoading(true);
    try {
      const data = await getRecentActivity();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name || !newTenant.slug) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createTenant(newTenant);
      setIsCreateOpen(false);
      setNewTenant({ name: '', slug: '', subscription_tier: 'trial', max_employees: 50 });
      loadData();
      loadActivities();
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleToggleActive = async (tenantId: string, currentStatus: boolean) => {
    try {
      await toggleTenantActive(tenantId, !currentStatus);
      loadData();
    } catch (error) {
      console.error('Error toggling tenant:', error);
    }
  };

  const handleManageSubscription = async (tenantId: string, data: { subscription_tier: string; max_employees: number }) => {
    try {
      await updateTenant(tenantId, {
        subscription_tier: data.subscription_tier as 'trial' | 'basic' | 'professional' | 'enterprise',
        max_employees: data.max_employees
      });
      loadData();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleCreateAdmin = async () => {
    if (!selectedTenant) return;
    if (!newAdmin.email || !newAdmin.password || !newAdmin.first_name || !newAdmin.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newAdmin.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreatingAdmin(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            first_name: newAdmin.first_name,
            last_name: newAdmin.last_name,
            role: 'superadmin',
            is_superadmin: 'true'
          },
          emailRedirectTo: `${window.location.origin}/auth?tenant=${selectedTenant.slug}`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            tenant_id: selectedTenant.id,
            is_active: true,
            status: 'active'
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        const { error: tenantUserError } = await supabase
          .from('tenant_users')
          .insert({
            tenant_id: selectedTenant.id,
            user_id: authData.user.id,
            is_tenant_admin: true
          });

        if (tenantUserError) {
          console.error('Tenant user error:', tenantUserError);
        }

        toast.success(`Admin user created for ${selectedTenant.name}`);
        setIsCreateAdminOpen(false);
        setNewAdmin({ email: '', password: '', first_name: '', last_name: '' });
        setSelectedTenant(null);
        loadData();
        loadActivities();
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const openViewDetails = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setIsDetailsOpen(true);
  };

  const openManageSubscription = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setIsSubscriptionOpen(true);
  };

  const openCreateAdmin = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setIsCreateAdminOpen(true);
  };

  if (authLoading || saasLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading SaaS Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dark Header */}
      <SaasAdminHeader onSignOut={signOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tenants</p>
                  <p className="text-3xl font-bold">{stats.totalTenants}</p>
                </div>
                <Building2 className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trials Ending Soon</p>
                  <p className="text-3xl font-bold">{stats.trialsEndingSoon}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <SystemHealthBadge status="operational" />
                </div>
                <CheckCircle className="h-10 w-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenants Table - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tenants" className="space-y-6">
              <TabsList>
                <TabsTrigger value="tenants">
                  <Building2 className="h-4 w-4 mr-2" />
                  Tenants
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tenants">
                <Card>
                  <CardHeader>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription>Manage all institutions on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TenantsTable
                      tenants={tenants}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onAddTenant={() => setIsCreateOpen(true)}
                      onViewDetails={openViewDetails}
                      onManageSubscription={openManageSubscription}
                      onToggleActive={handleToggleActive}
                      onCreateAdmin={openCreateAdmin}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>Insights across all tenants</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics dashboard coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>Configure global platform settings</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Settings panel coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Activity Log - Takes 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <RecentActivityLog activities={activities} loading={activitiesLoading} />
          </div>
        </div>
      </main>

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Institution Name *</Label>
              <Input 
                placeholder="e.g., Greenwood Academy"
                value={newTenant.name}
                onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL identifier) *</Label>
              <Input 
                placeholder="e.g., greenwood-academy"
                value={newTenant.slug}
                onChange={(e) => setNewTenant({ 
                  ...newTenant, 
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subscription Tier</Label>
              <Select 
                value={newTenant.subscription_tier}
                onValueChange={(value) => setNewTenant({ 
                  ...newTenant, 
                  subscription_tier: value,
                  max_employees: SUBSCRIPTION_TIERS[value as keyof typeof SUBSCRIPTION_TIERS]?.maxEmployees || 50
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial (10 employees)</SelectItem>
                  <SelectItem value="basic">Basic (25 employees)</SelectItem>
                  <SelectItem value="professional">Professional (100 employees)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Employees</Label>
              <Input 
                type="number"
                value={newTenant.max_employees}
                onChange={(e) => setNewTenant({ ...newTenant, max_employees: parseInt(e.target.value) || 50 })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateTenant}>Create Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={isCreateAdminOpen} onOpenChange={(open) => {
        setIsCreateAdminOpen(open);
        if (!open) setSelectedTenant(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tenant Admin</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: selectedTenant.primary_color || '#3B82F6' }}
                >
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{selectedTenant.name}</p>
                  <p className="text-sm text-muted-foreground">/{selectedTenant.slug}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input 
                    value={newAdmin.first_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input 
                    value={newAdmin.last_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input 
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateAdmin} disabled={creatingAdmin}>
              {creatingAdmin ? 'Creating...' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Details Dialog */}
      <TenantDetailsDialog 
        tenant={selectedTenant}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedTenant(null);
        }}
      />

      {/* Manage Subscription Dialog */}
      <ManageSubscriptionDialog
        tenant={selectedTenant}
        open={isSubscriptionOpen}
        onOpenChange={(open) => {
          setIsSubscriptionOpen(open);
          if (!open) setSelectedTenant(null);
        }}
        onSave={handleManageSubscription}
      />
    </div>
  );
};

export default SaasAdmin;
