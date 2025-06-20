
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Remove authentication check - allow access to everyone
  return <>{children}</>;
};

export default ProtectedRoute;
