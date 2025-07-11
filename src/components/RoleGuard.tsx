
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { hasRoleAccess, getRoleDisplayName } from '@/utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackMessage?: string;
}

const RoleGuard = ({ children, allowedRoles, fallbackMessage }: RoleGuardProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  console.log('RoleGuard - Profile:', profile);
  console.log('RoleGuard - User role:', profile?.role);
  console.log('RoleGuard - Allowed roles:', allowedRoles);
  console.log('RoleGuard - Has access:', hasRoleAccess(profile?.role, allowedRoles));

  if (!profile || !hasRoleAccess(profile.role, allowedRoles)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="border-red-200 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Access Restricted</h2>
            <p className="text-red-600 mb-4">
              {fallbackMessage || "You don't have permission to access this section."}
            </p>
            <div className="text-sm text-gray-600">
              <p>Your role: <span className="font-medium">{getRoleDisplayName(profile?.role)}</span></p>
              <p>Required roles: <span className="font-medium">{allowedRoles.map(getRoleDisplayName).join(', ')}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
