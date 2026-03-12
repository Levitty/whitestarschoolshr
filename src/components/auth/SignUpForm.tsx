import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Mail, Lock, UserCheck } from 'lucide-react';
import { getAvailableRoles } from '@/utils/roleUtils';
import type { UserRole } from '@/types/auth';
import { useTenant } from '@/contexts/TenantContext';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { tenant } = useTenant();

  const departments = [
    'Administration',
    'Mathematics',
    'English',
    'Science',
    'Social Studies',
    'Physical Education',
    'Arts',
    'Technology',
    'Special Education',
    'Counseling'
  ];

  // Get all available roles including superadmin for signup
  const getAllRoles = (): { value: UserRole; label: string }[] => [
    ...getAvailableRoles(tenant?.tenant_type),
    { value: 'superadmin', label: 'Super Administrator' }
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !department || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Starting signup process for:', { email, role, fullName, department });
    setLoading(true);

    const { error } = await signUp(email, password, fullName, department, role);
    
    if (error) {
      console.error('Signup error:', error);
      
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Try signing in instead.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      console.log('Signup successful for role:', role);
      toast({
        title: "Account Created!",
        description: role === 'superadmin' 
          ? "Super administrator account has been created and activated successfully! You can now sign in."
          : "Your account has been created and is pending approval from an administrator.",
      });
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      setDepartment('');
      setRole('staff');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-fullname">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="signup-fullname"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-role">Role</Label>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Select value={role} onValueChange={(value: UserRole) => setRole(value)} required>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {getAllRoles().map((roleOption) => (
                <SelectItem key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                  {roleOption.value === 'superadmin' && (
                    <span className="ml-2 text-xs text-red-600 font-medium">(Admin)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-department">Department</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Select value={department} onValueChange={setDepartment} required>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="signup-email"
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
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            minLength={6}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-sm text-center text-slate-600 bg-blue-50 p-3 rounded-lg">
        {role === 'superadmin' ? (
          <>
            <p className="font-medium text-red-800">Super Administrator Account</p>
            <p>This account will have full administrative privileges and will be activated immediately.</p>
          </>
        ) : (
          <>
            <p className="font-medium text-blue-800">Account Approval Required</p>
            <p>Your account will be reviewed by an administrator before activation.</p>
          </>
        )}
      </div>
    </form>
  );
};

export default SignUpForm;
