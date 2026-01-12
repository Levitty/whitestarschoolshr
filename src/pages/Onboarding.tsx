import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EmployeeOnboarding from '@/components/EmployeeOnboarding';

const Onboarding = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // If onboarding is already completed, redirect to dashboard
      const onboardingCompleted = (profile as any)?.onboarding_completed;
      const isSuperAdminOrAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';
      
      if (onboardingCompleted || isSuperAdminOrAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <EmployeeOnboarding />;
};

export default Onboarding;
