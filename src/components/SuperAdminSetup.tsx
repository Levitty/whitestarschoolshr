
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const SuperAdminSetup = () => {
  const { user, signUp } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: 'Super',
    lastName: 'Admin'
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // First create the user account
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (signUpError) {
        toast({
          title: "Error",
          description: signUpError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Super admin account created! Please check your email to verify your account, then sign in to complete the setup.",
      });

      setFormData({ email: '', password: '', firstName: 'Super', lastName: 'Admin' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create super admin account.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleMakeSuperAdmin = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await updateProfile({ role: 'admin' });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update role.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "You are now a super admin!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive"
      });
    }
  };

  // If user is already an admin, show success message
  if (profile?.role === 'admin') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Super Admin Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You have super admin privileges and can access all administrative features.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If user is logged in but not admin, allow them to become admin
  if (user && profile) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Become Super Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Click below to grant yourself super admin privileges.
          </p>
          <Button onClick={handleMakeSuperAdmin} className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Grant Super Admin Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no user is logged in, show registration form
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Create Super Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@school.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter a strong password"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Super Admin Account'}
          </Button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          This will create the first admin account for your school's HR system.
        </p>
      </CardContent>
    </Card>
  );
};

export default SuperAdminSetup;
