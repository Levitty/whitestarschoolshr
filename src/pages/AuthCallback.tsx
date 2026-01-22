import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check URL hash for recovery type (Supabase puts type=recovery in hash for password reset)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        
        // If this is a password recovery link, redirect immediately to reset page
        if (type === 'recovery' && accessToken) {
          console.log('Password recovery detected, redirecting to reset page');
          navigate('/reset-password');
          return;
        }

        // For other flows (magic link, email confirmation), get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to authenticate. The link may have expired.');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event);
          
          if (event === 'PASSWORD_RECOVERY') {
            navigate('/reset-password');
          } else if (event === 'SIGNED_IN' && session) {
            navigate('/dashboard');
          } else if (event === 'TOKEN_REFRESHED' && session) {
            navigate('/dashboard');
          }
        });

        // If we have a session and this isn't a recovery flow, redirect to dashboard
        if (session) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Redirecting to login...');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-muted-foreground text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Authenticating...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
