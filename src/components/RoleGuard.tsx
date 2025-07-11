
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('superadmin' | 'head' | 'teacher' | 'staff')[];
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

  if (!profile || !allowedRoles.includes(profile.role!)) {
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
              <p>Your role: <span className="font-medium">{profile?.role || 'Unknown'}</span></p>
              <p>Required roles: <span className="font-medium">{allowedRoles.join(', ')}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
