import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session - Supabase will automatically exchange the code from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to authenticate. The link may have expired.');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Listen for auth state changes to detect PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event);
          
          if (event === 'PASSWORD_RECOVERY') {
            // User clicked a password reset link
            navigate('/reset-password');
          } else if (event === 'SIGNED_IN' && session) {
            // User signed in via magic link or email confirmation
            navigate('/dashboard');
          } else if (event === 'TOKEN_REFRESHED' && session) {
            // Session was refreshed, redirect to dashboard
            navigate('/dashboard');
          }
        });

        // If we already have a session and no specific event, redirect to dashboard
        if (session) {
          // Small delay to allow event listeners to fire first
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
