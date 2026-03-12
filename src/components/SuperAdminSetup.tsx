import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { getAvailableRoles } from '@/utils/roleUtils';
import { useTenant } from '@/contexts/TenantContext';

interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  role: 'superadmin' | 'admin' | 'head' | 'teacher' | 'staff' | 'secretary' | 'driver' | 'support_staff' | null;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
  hire_date: string | null;
  is_active: boolean | null;
  status: 'pending' | 'active' | 'inactive' | 'suspended' | null;
  created_at: string | null;
  updated_at: string | null;
}

const SuperAdminSetup = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { tenant } = useTenant();

  const transformProfileData = (data: any): ProfileData => {
    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      department: data.department,
      role: data.role as 'superadmin' | 'admin' | 'head' | 'teacher' | 'staff' | 'secretary' | 'driver' | 'support_staff' | null,
      avatar_url: data.avatar_url,
      phone: data.phone,
      employee_id: data.employee_id,
      hire_date: data.hire_date,
      is_active: data.is_active,
      status: data.status as 'pending' | 'active' | 'inactive' | 'suspended' | null,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user profiles.",
          variant: "destructive"
        });
      } else {
        const transformedData = (data || []).map(transformProfileData);
        setProfiles(transformedData);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: isActive,
          status: isActive ? 'active' : 'inactive'
        })
        .eq('id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user status.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `User status updated to ${isActive ? 'active' : 'inactive'}.`,
        });
        fetchProfiles();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, role: 'superadmin' | 'admin' | 'head' | 'teacher' | 'staff' | 'secretary' | 'driver' | 'support_staff') => {
    try {
      // First, delete existing role from user_roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        toast({
          title: "Error",
          description: `Failed to remove old role: ${deleteError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Then insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (insertError) {
        toast({
          title: "Error",
          description: `Failed to update user role: ${insertError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Also update the role in profiles for backward compatibility
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (profileError) {
        console.warn('Failed to update profile role (non-critical):', profileError);
      }

      toast({
        title: "Success",
        description: `User role updated to ${role}.`,
      });

      fetchProfiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
           profile.email.toLowerCase().includes(searchLower) ||
           profile.department?.toLowerCase().includes(searchLower) ||
           profile.role?.toLowerCase().includes(searchLower);
  });

  const getStatusBadge = (status: string | null, isActive: boolean | null) => {
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
    }
    if (status === 'suspended') {
      return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
    }
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge className="bg-gray-100 text-gray-800">No Role</Badge>;
    
    const roleColors = {
      superadmin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      head: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      staff: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors]}>
        {role === 'superadmin' && <Shield className="w-3 h-3 mr-1" />}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    {getStatusBadge(profile.status, profile.is_active)}
                    {getRoleBadge(profile.role)}
                  </div>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-gray-600">{profile.department || 'No Department'}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={profile.role || 'staff'}
                    onValueChange={(value) => updateUserRole(profile.id, value as any)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles(tenant?.tenant_type).map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {!profile.is_active || profile.status === 'pending' ? (
                    <Button
                      onClick={() => updateUserStatus(profile.id, true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      {profile.status === 'pending' ? 'Approve' : 'Activate'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => updateUserStatus(profile.id, false)}
                      size="sm"
                      variant="outline"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No users found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuperAdminSetup;
