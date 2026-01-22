import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import { logLoginAttempt } from '@/hooks/useLoginAudit';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in attempt for:', email);
    setLoading(true);

    const { error, userId, tenantId } = await signIn(email, password);
    
    if (error) {
      console.error('Sign in error:', error);
      
      // Determine error type and user-friendly message for logging
      let errorType = 'unknown';
      let errorMessage = error.message;
      let toastTitle = "Sign In Failed";
      
      if (error.message.includes('Email not confirmed')) {
        errorType = 'email_not_confirmed';
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
        toastTitle = "Email Not Verified";
      } else if (error.message.includes('Invalid login credentials')) {
        errorType = 'invalid_credentials';
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Too many requests')) {
        errorType = 'rate_limited';
        errorMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
        toastTitle = "Rate Limited";
      } else if (error.name === 'AccountNotApproved') {
        errorType = 'account_pending';
        toastTitle = "Account Pending Approval";
        errorMessage = 'Your account is pending admin approval. You will receive an email once approved.';
      } else if (error.name === 'AccountDeactivated') {
        errorType = 'account_inactive';
        toastTitle = "Account Deactivated";
        errorMessage = 'Your account has been deactivated. Please contact your administrator.';
      } else if (error.name === 'ProfileError') {
        errorType = 'profile_error';
        toastTitle = "Account Error";
        errorMessage = 'There was an issue with your account. Please contact support.';
      }
      
      // Log failed attempt
      await logLoginAttempt(email, false, errorType, errorMessage, userId, tenantId);
      
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      console.log('Sign in successful');
      
      // Log successful attempt
      await logLoginAttempt(email, true, undefined, undefined, userId, tenantId);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="signin-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <ForgotPasswordDialog />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="signin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
      
      <div className="text-sm text-center text-muted-foreground">
        <p>Having trouble signing in? Make sure your account has been approved by an administrator.</p>
      </div>
    </form>
  );
};

export default SignInForm;
