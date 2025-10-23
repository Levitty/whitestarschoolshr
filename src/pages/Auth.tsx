
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { School, Shield } from 'lucide-react';
import SignInForm from '@/components/auth/SignInForm';
import StaffSignUpForm from '@/components/auth/StaffSignUpForm';

const Auth = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.status === 'pending') {
        toast({
          title: "Account Pending Approval",
          description: "Your account is awaiting approval from an administrator.",
          variant: "default"
        });
        return;
      }
      
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        toast({
          title: "Account Inactive",
          description: "Your account has been deactivated. Please contact an administrator.",
          variant: "destructive"
        });
        return;
      }
      
      // Redirect based on role
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <School className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">School HR Portal</h1>
          </div>
          <p className="text-slate-600">
            Comprehensive Human Resources Management System
          </p>
        </div>

        {/* Auth Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <SignInForm />
              </TabsContent>
              
              <TabsContent value="signup">
                <StaffSignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Super Admin Access */}
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Administrator Access</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin-auth')}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Super Admin Portal
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600">
          <p>Secure, compliant, and user-friendly HR management</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
