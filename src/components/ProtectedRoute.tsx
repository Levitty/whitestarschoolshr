
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();

  console.log('ProtectedRoute - Auth state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading,
    userEmail: user?.email 
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user/session, redirect to auth
  if (!user || !session) {
    window.location.href = '/auth';
    return null;
  }

  // User is authenticated, allow access (all users are super admin)
  return <>{children}</>;
};

export default ProtectedRoute;
