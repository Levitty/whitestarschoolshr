
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, Clock, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { UserRole, UserStatus } from '@/types/auth';

interface PendingUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  role: UserRole | null;
  phone: string | null;
  status: UserStatus | null;
  created_at: string | null;
}

const AccountApprovalManager = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending registrations.",
          variant: "destructive"
        });
      } else {
        // Transform the data to match our PendingUser interface
        const transformedData: PendingUser[] = (data || []).map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          department: user.department,
          role: user.role as UserRole | null,
          phone: user.phone,
          status: user.status as UserStatus | null,
          created_at: user.created_at,
        }));
        setPendingUsers(transformedData);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: UserStatus, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status,
          is_active: isActive
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
          description: `User ${status === 'active' ? 'approved' : 'rejected'} successfully.`,
        });
        fetchPendingUsers(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

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
        fetchPendingUsers(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const getRoleDisplayName = (role: UserRole | null): string => {
    if (!role) return 'No Role';
    const names = {
      superadmin: 'Super Administrator',
      admin: 'Administrator',
      head: 'Head Teacher',
      teacher: 'Teacher',
      staff: 'Staff Member',
      secretary: 'Secretary',
      driver: 'Driver',
      support_staff: 'Support Staff'
    };
    return names[role];
  };

  const getRoleBadgeColor = (role: UserRole | null): string => {
    if (!role) return 'bg-gray-100 text-gray-800';
    const colors = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      head: 'bg-purple-100 text-purple-800',
      teacher: 'bg-green-100 text-green-800',
      staff: 'bg-gray-100 text-gray-800',
      secretary: 'bg-pink-100 text-pink-800',
      driver: 'bg-yellow-100 text-yellow-800',
      support_staff: 'bg-orange-100 text-orange-800'
    };
    return colors[role];
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Approvals</h2>
          <p className="text-gray-600 mt-1">Review and approve pending user registrations</p>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
          <Clock className="w-4 h-4 mr-1" />
          {pendingUsers.length} Pending
        </Badge>
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending registrations require approval at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <Card key={user.id} className="border-l-4 border-l-yellow-400">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                        )}
                        {user.department && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{user.department}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Requested Role:</span>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={user.role || 'staff'}
                        onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff Member</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="head">Head Teacher</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="support_staff">Support Staff</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateUserStatus(user.id, 'active', true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateUserStatus(user.id, 'inactive', false)}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountApprovalManager;
