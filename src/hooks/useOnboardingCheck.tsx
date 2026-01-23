import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingCheck = () => {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkOnboardingStatus = async () => {
    if (!user?.id) {
      setNeedsOnboarding(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setNeedsOnboarding(false);
      } else {
        // User needs onboarding if:
        // 1. onboarding_completed is false or null
        // 2. AND their status is 'active' (approved accounts only)
        const needsSetup = !data.onboarding_completed && data.status === 'active';
        console.log('Onboarding check:', { 
          onboarding_completed: data.onboarding_completed, 
          status: data.status,
          needsSetup 
        });
        setNeedsOnboarding(needsSetup);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user?.id]);

  const markOnboardingComplete = () => {
    setNeedsOnboarding(false);
  };

  return {
    needsOnboarding,
    loading,
    markOnboardingComplete,
    recheckOnboarding: checkOnboardingStatus,
  };
};
