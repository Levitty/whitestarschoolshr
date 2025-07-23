
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings, Users, FileText, Calendar, UserCheck, Plus, Edit2, Trash2 } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  icon: any;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'view_employees',
    name: 'View Employees',
    description: 'Can view employee profiles and information',
    module: 'Employee Management',
    icon: Users
  },
  {
    id: 'edit_employees',
    name: 'Edit Employees',
    description: 'Can create and edit employee records',
    module: 'Employee Management',
    icon: UserCheck
  },
  {
    id: 'delete_employees',
    name: 'Delete Employees',
    description: 'Can delete employee records',
    module: 'Employee Management',
    icon: UserCheck
  },
  {
    id: 'view_documents',
    name: 'View Documents',
    description: 'Can view documents and records',
    module: 'Document Management',
    icon: FileText
  },
  {
    id: 'edit_documents',
    name: 'Edit Documents',
    description: 'Can upload, edit, and manage documents',
    module: 'Document Management',
    icon: FileText
  },
  {
    id: 'view_performance',
    name: 'View Performance',
    description: 'Can view performance evaluations',
    module: 'Performance Management',
    icon: Settings
  },
  {
    id: 'edit_performance',
    name: 'Edit Performance',
    description: 'Can create and edit performance evaluations',
    module: 'Performance Management',
    icon: Settings
  },
  {
    id: 'approve_performance',
    name: 'Approve Performance',
    description: 'Can approve performance evaluations',
    module: 'Performance Management',
    icon: Settings
  },
  {
    id: 'approve_leaves',
    name: 'Approve Leave',
    description: 'Can approve or reject leave requests',
    module: 'Leave Management',
    icon: Calendar
  },
  {
    id: 'view_leaves',
    name: 'View Leave',
    description: 'Can view leave requests and balances',
    module: 'Leave Management',
    icon: Calendar
  },
  {
    id: 'edit_leaves',
    name: 'Edit Leave',
    description: 'Can create and edit leave requests',
    module: 'Leave Management',
    icon: Calendar
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Can view system reports and analytics',
    module: 'Reporting',
    icon: Settings
  },
  {
    id: 'view_recruitment',
    name: 'View Recruitment',
    description: 'Can view recruitment data and applications',
    module: 'Recruitment',
    icon: Users
  },
  {
    id: 'edit_recruitment',
    name: 'Edit Recruitment',
    description: 'Can manage job postings and applications',
    module: 'Recruitment',
    icon: Users
  },
  {
    id: 'manage_settings',
    name: 'Manage Settings',
    description: 'Can access system settings and configuration',
    module: 'System',
    icon: Settings
  },
  {
    id: 'manage_roles',
    name: 'Manage Roles',
    description: 'Can manage roles and permissions',
    module: 'System',
    icon: Shield
  }
];

const RolePermissionsManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({ name: '', description: '', permissions: [] });
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      console.log('Loading roles...');
      
      // Load roles with their permissions
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
        throw rolesError;
      }

      console.log('Roles loaded:', rolesData);

      // Load role permissions
      const { data: rolePermissions, error: permError } = await supabase
        .from('role_permissions')
        .select(`
          role_id,
          permission_id,
          permissions (name)
        `);

      if (permError) {
        console.error('Error loading role permissions:', permError);
        throw permError;
      }

      console.log('Role permissions loaded:', rolePermissions);

      // Combine roles with their permissions
      const rolesWithPermissions = rolesData.map(role => ({
        ...role,
        permissions: rolePermissions
          .filter(rp => rp.role_id === role.id)
          .map(rp => rp.permissions.name)
      }));

      console.log('Roles with permissions:', rolesWithPermissions);
      setRoles(rolesWithPermissions);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles and permissions.",
        variant: "destructive"
      });
    }
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating role:', formData);
      
      // Create the role
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert([{
          name: formData.name.toLowerCase().replace(/\s+/g, '_'),
          description: formData.description
        }])
        .select()
        .single();

      if (roleError) {
        console.error('Error creating role:', roleError);
        throw roleError;
      }

      console.log('Role created:', newRole);

      // Assign permissions to the role
      if (formData.permissions.length > 0) {
        // Get permission IDs
        const { data: permissions, error: permissionsError } = await supabase
          .from('permissions')
          .select('id, name')
          .in('name', formData.permissions);

        if (permissionsError) {
          console.error('Error fetching permissions:', permissionsError);
          throw permissionsError;
        }

        // Create role-permission associations
        const rolePermissionInserts = permissions.map(permission => ({
          role_id: newRole.id,
          permission_id: permission.id
        }));

        const { error: rolePermError } = await supabase
          .from('role_permissions')
          .insert(rolePermissionInserts);

        if (rolePermError) {
          console.error('Error assigning permissions:', rolePermError);
          throw rolePermError;
        }
      }

      toast({
        title: "Success",
        description: "Role created successfully.",
      });

      setFormData({ name: '', description: '', permissions: [] });
      setShowCreateDialog(false);
      loadRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (roleName === 'superadmin') {
      toast({
        title: "Error",
        description: "Cannot delete the superadmin role.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully.",
      });

      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRolePermission = async (roleId: string, permissionName: string, enabled: boolean) => {
    try {
      if (enabled) {
        // Add permission
        const { data: permission } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', permissionName)
          .single();

        if (permission) {
          const { error } = await supabase
            .from('role_permissions')
            .insert([{
              role_id: roleId,
              permission_id: permission.id
            }]);

          if (error) throw error;
        }
      } else {
        // Remove permission
        const { data: permission } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', permissionName)
          .single();

        if (permission) {
          const { error } = await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId)
            .eq('permission_id', permission.id);

          if (error) throw error;
        }
      }

      // Update local state
      setRoles(prev => 
        prev.map(role => {
          if (role.id === roleId) {
            const newPermissions = enabled 
              ? [...role.permissions, permissionName]
              : role.permissions.filter(p => p !== permissionName);
            return { ...role, permissions: newPermissions };
          }
          return role;
        })
      );
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission.",
        variant: "destructive"
      });
    }
  };

  const handlePermissionToggle = (permissionName: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: enabled 
        ? [...prev.permissions, permissionName]
        : prev.permissions.filter(p => p !== permissionName)
    }));
  };

  const getRoleDisplayName = (name: string): string => {
    const names = {
      superadmin: 'Super Administrator',
      admin: 'Administrator',
      head: 'Head Teacher',
      teacher: 'Teacher',
      staff: 'Staff Member',
      secretary: 'Secretary',
      driver: 'Driver',
      support_staff: 'Support Staff',
      counselor: 'Counselor'
    };
    return names[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  const getRoleBadgeColor = (name: string): string => {
    const colors = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      head: 'bg-purple-100 text-purple-800',
      teacher: 'bg-green-100 text-green-800',
      staff: 'bg-gray-100 text-gray-800',
      secretary: 'bg-pink-100 text-pink-800',
      driver: 'bg-yellow-100 text-yellow-800',
      support_staff: 'bg-orange-100 text-orange-800',
      counselor: 'bg-teal-100 text-teal-800'
    };
    return colors[name] || 'bg-gray-100 text-gray-800';
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Permissions</h2>
          <p className="text-gray-600 mt-1">Configure what each role can access and do in the system</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name (e.g., Counselor)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Permissions</h3>
                {Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module} className="space-y-3">
                    <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                      {module}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => {
                        const isEnabled = formData.permissions.includes(permission.name);
                        const Icon = permission.icon;
                        
                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="font-medium text-sm">{permission.name}</p>
                                <p className="text-xs text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(enabled) => 
                                handlePermissionToggle(permission.name, enabled)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setFormData({ name: '', description: '', permissions: [] });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  {getRoleDisplayName(role.name)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(role.name)}>
                    {role.name}
                  </Badge>
                  {role.name !== 'superadmin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              {role.description && (
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module} className="space-y-3">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      {module}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map((permission) => {
                        const isEnabled = role.permissions.includes(permission.name);
                        const Icon = permission.icon;
                        
                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="font-medium text-sm">{permission.name}</p>
                                <p className="text-xs text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(enabled) => 
                                updateRolePermission(role.id, permission.name, enabled)
                              }
                              disabled={role.name === 'superadmin'} // Superadmin always has all permissions
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolePermissionsManager;
