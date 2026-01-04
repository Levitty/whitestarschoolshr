import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSaasAdmin } from '@/hooks/useSaasAdmin';
import { TenantWithStats, SUBSCRIPTION_TIERS } from '@/types/tenant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Plus, 
  Settings, 
  LogOut,
  Crown,
  BarChart3,
  Shield,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '@/assets/whitestar-logo.png';

const SaasAdmin = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isSaasAdmin, loading: saasLoading, fetchTenants, createTenant, toggleTenantActive, getPlatformStats } = useSaasAdmin();
  
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalEmployees: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    subscription_tier: 'trial',
    max_employees: 50
  });

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

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || saasLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SaaS Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Logo" className="h-10 w-auto" />
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-lg">SaaS Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <Building2 className="h-4 w-4 mr-2" />
                Go to App
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Tenants</p>
                  <p className="text-3xl font-bold">{stats.activeTenants}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </div>
                <Shield className="h-10 w-10 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription>Manage all institutions on the platform</CardDescription>
                  </div>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tenant
                      </Button>
                    </DialogTrigger>
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tenants..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredTenants.map((tenant) => (
                    <div 
                      key={tenant.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: tenant.primary_color || '#3B82F6' }}
                        >
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{tenant.name}</h3>
                          <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Employees</p>
                          <p className="font-medium">{tenant.employee_count} / {tenant.max_employees === -1 ? '∞' : tenant.max_employees}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Users</p>
                          <p className="font-medium">{tenant.user_count}</p>
                        </div>
                        <Badge className={getTierBadgeColor(tenant.subscription_tier)}>
                          {tenant.subscription_tier}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tenant.is_active}
                            onCheckedChange={() => handleToggleActive(tenant.id, tenant.is_active)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {tenant.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Overview of platform usage and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
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
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Settings panel coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SaasAdmin;
