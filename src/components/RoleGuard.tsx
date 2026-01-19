import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { hasRoleAccess, getRoleDisplayName } from '@/utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackMessage?: string;
}

const RoleGuard = ({ children, allowedRoles, fallbackMessage }: RoleGuardProps) => {
  const { profile, loading } = useAuth();
  const { tenant } = useTenant();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!profile || !hasRoleAccess(profile.role, allowedRoles)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="border-destructive/20 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Access Restricted</h2>
            <p className="text-destructive/80 mb-4">
              {fallbackMessage || "You don't have permission to access this section."}
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Your role: <span className="font-medium">{getRoleDisplayName(profile?.role, tenant?.slug)}</span></p>
              <p>Required roles: <span className="font-medium">{allowedRoles.map(r => getRoleDisplayName(r, tenant?.slug)).join(', ')}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
