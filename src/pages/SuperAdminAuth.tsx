
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail } from 'lucide-react';

const SuperAdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role !== 'superadmin') {
        toast({
          title: "Access Denied",
          description: "This portal is only for super administrators.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Portal</h1>
          </div>
          <p className="text-slate-600">
            Restricted access for system administrators only
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-center text-red-800">Administrator Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter administrator email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-red-200 focus:border-red-400"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter administrator password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-red-200 focus:border-red-400"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In as Administrator'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600">
          <p>Regular staff access? <button onClick={() => navigate('/auth')} className="text-blue-600 hover:underline">Click here</button></p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuth;
