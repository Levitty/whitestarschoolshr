import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - loading:', loading, 'user:', user, 'profile:', profile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if onboarding is completed (skip for superadmins and admins)
  const isSuperAdminOrAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';
  const onboardingCompleted = (profile as any)?.onboarding_completed;
  
  if (profile && !isSuperAdminOrAdmin && !onboardingCompleted && location.pathname !== '/onboarding') {
    console.log('ProtectedRoute - Onboarding not completed, redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
