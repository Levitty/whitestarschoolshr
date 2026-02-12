import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EmployeeOnboarding from '@/components/EmployeeOnboarding';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          Skip for now
        </Button>
      </div>
      <EmployeeOnboarding />
    </div>
  );
};

export default Onboarding;
