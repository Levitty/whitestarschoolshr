
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  department: string | null;
  role: 'superadmin' | 'head' | 'teacher' | 'staff';
  status: 'pending' | 'active';
  created_at: string;
  updated_at: string;
}

const SuperAdminSetup = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        setProfiles(data || []);
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

  const updateUserStatus = async (userId: string, status: 'active' | 'pending') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user status.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `User status updated to ${status}.`,
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

  const updateUserRole = async (userId: string, role: 'superadmin' | 'head' | 'teacher' | 'staff') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `User role updated to ${role}.`,
        });
        fetchProfiles();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      superadmin: 'bg-purple-100 text-purple-800',
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
                    <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                    {getStatusBadge(profile.status)}
                    {getRoleBadge(profile.role)}
                  </div>
                  <p className="text-gray-600">{profile.department || 'No Department'}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={profile.role}
                    onValueChange={(value) => updateUserRole(profile.user_id, value as any)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="head">Head</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {profile.status === 'pending' ? (
                    <Button
                      onClick={() => updateUserStatus(profile.user_id, 'active')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      onClick={() => updateUserStatus(profile.user_id, 'pending')}
                      size="sm"
                      variant="outline"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Suspend
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
