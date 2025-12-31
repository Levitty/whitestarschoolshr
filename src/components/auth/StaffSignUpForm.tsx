import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDepartments } from '@/hooks/useDepartments';
import { User, Building, Mail, Lock, UserCheck, Loader2, MapPin } from 'lucide-react';
import type { UserRole } from '@/types/auth';

const StaffSignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { departments, loading: departmentsLoading } = useDepartments();

  // Staff-only roles (no superadmin)
  const staffRoles: { value: UserRole; label: string }[] = [
    { value: 'head', label: 'Head Teacher' },
    { value: 'deputy_head', label: 'Deputy Head Teacher' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'driver', label: 'Driver' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'staff', label: 'General Staff' }
  ];

  const branches = [
    { value: 'langata', label: 'Langata Branch' },
    { value: 'sabaki', label: 'Sabaki Branch' }
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !department || !role || !branch) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including branch.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Starting staff signup process for:', { email, role, fullName, department, branch });
    setLoading(true);

    const { error } = await signUp(email, password, fullName, department, role, branch);
    
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
      console.log('Staff signup successful');
      toast({
        title: "Account Created!",
        description: "Your account has been created and is pending approval from an administrator. You will be notified once your account is activated.",
      });
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      setDepartment('');
      setRole('staff');
      setBranch('');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="staff-fullname">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="staff-fullname"
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
        <Label htmlFor="staff-role">Role</Label>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Select value={role} onValueChange={(value: UserRole) => setRole(value)} required>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {staffRoles.map((roleOption) => (
                <SelectItem key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff-department">Department</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Select value={department} onValueChange={setDepartment} required disabled={departmentsLoading}>
            <SelectTrigger className="pl-10">
              {departmentsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select your department" />
              )}
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff-branch">Branch</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Select value={branch} onValueChange={setBranch} required>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Select your branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branchOption) => (
                <SelectItem key={branchOption.value} value={branchOption.value}>
                  {branchOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="staff-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="staff-email"
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
        <Label htmlFor="staff-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="staff-password"
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
        <p className="font-medium text-blue-800">Account Approval Required</p>
        <p>Your account will be reviewed by an administrator before activation. You will receive notification once approved.</p>
      </div>
    </form>
  );
};

export default StaffSignUpForm;
