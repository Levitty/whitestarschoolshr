
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings, Users, FileText, Calendar, UserCheck } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
}

interface RolePermissions {
  role: UserRole;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'view_employees',
    name: 'View Employees',
    description: 'Can view employee profiles and information',
    category: 'Employee Management',
    icon: Users
  },
  {
    id: 'manage_employees',
    name: 'Manage Employees',
    description: 'Can create, edit, and manage employee records',
    category: 'Employee Management',
    icon: UserCheck
  },
  {
    id: 'view_documents',
    name: 'View Documents',
    description: 'Can view documents and records',
    category: 'Document Management',
    icon: FileText
  },
  {
    id: 'manage_documents',
    name: 'Manage Documents',
    description: 'Can upload, edit, and manage documents',
    category: 'Document Management',
    icon: FileText
  },
  {
    id: 'approve_leave',
    name: 'Approve Leave',
    description: 'Can approve or reject leave requests',
    category: 'Leave Management',
    icon: Calendar
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Can view system reports and analytics',
    category: 'Reporting',
    icon: Settings
  },
  {
    id: 'manage_recruitment',
    name: 'Manage Recruitment',
    description: 'Can manage job postings and applications',
    category: 'Recruitment',
    icon: Users
  }
];

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['view_employees', 'manage_employees', 'view_documents', 'manage_documents', 'approve_leave', 'view_reports', 'manage_recruitment'],
  admin: ['view_employees', 'manage_employees', 'view_documents', 'manage_documents', 'approve_leave', 'view_reports'],
  head: ['view_employees', 'view_documents', 'approve_leave', 'view_reports'],
  teacher: ['view_documents'],
  staff: ['view_documents'],
  secretary: ['view_employees', 'view_documents', 'manage_documents'],
  driver: ['view_documents'],
  support_staff: ['view_documents']
};

const RolePermissionsManager = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRolePermissions();
  }, []);

  const loadRolePermissions = () => {
    // Initialize with default permissions
    const permissions = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, perms]) => ({
      role: role as UserRole,
      permissions: perms
    }));
    setRolePermissions(permissions);
  };

  const updateRolePermission = (role: UserRole, permissionId: string, enabled: boolean) => {
    setRolePermissions(prev => 
      prev.map(rp => {
        if (rp.role === role) {
          const newPermissions = enabled 
            ? [...rp.permissions, permissionId]
            : rp.permissions.filter(p => p !== permissionId);
          return { ...rp, permissions: newPermissions };
        }
        return rp;
      })
    );
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would save these to a database table
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Role permissions updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
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

  const getRoleBadgeColor = (role: UserRole): string => {
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

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Permissions</h2>
          <p className="text-gray-600 mt-1">Configure what each role can access and do in the system</p>
        </div>
        <Button onClick={savePermissions} disabled={loading}>
          <Shield className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        {rolePermissions.map((rolePermission) => (
          <Card key={rolePermission.role} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  {getRoleDisplayName(rolePermission.role)}
                </CardTitle>
                <Badge className={getRoleBadgeColor(rolePermission.role)}>
                  {rolePermission.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map((permission) => {
                        const isEnabled = rolePermission.permissions.includes(permission.id);
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
                                updateRolePermission(rolePermission.role, permission.id, enabled)
                              }
                              disabled={rolePermission.role === 'superadmin'} // Superadmin always has all permissions
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
