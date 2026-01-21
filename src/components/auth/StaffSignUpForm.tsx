import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDepartments } from '@/hooks/useDepartments';
import { supabase } from '@/integrations/supabase/client';
import { User, Building, Mail, Lock, UserCheck, Loader2, MapPin } from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface StaffSignUpFormProps {
  tenantId?: string;
  tenantName?: string;
}

interface Branch {
  value: string;
  label: string;
}

const StaffSignUpForm = ({ tenantId, tenantName }: StaffSignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { departments, loading: departmentsLoading } = useDepartments(tenantId);

  // Debug logging
  useEffect(() => {
    console.log('StaffSignUpForm - tenantId:', tenantId, 'tenantName:', tenantName);
    console.log('StaffSignUpForm - departments loaded:', departments.length, departments);
  }, [tenantId, tenantName, departments]);

  // Fetch branches for the tenant
  useEffect(() => {
    const fetchBranches = async () => {
      console.log('Fetching branches for tenant:', tenantId);
      
      if (!tenantId) {
        // Default branches for platform-level signup
        console.log('No tenantId, using default branch');
        setBranches([
          { value: 'main', label: 'Main Branch' }
        ]);
        setBranchesLoading(false);
        return;
      }
      
      setBranchesLoading(true);
      
      // First try to fetch from branches table if it exists, otherwise from employee_profiles
      try {
        const { data: branchData, error } = await supabase
          .from('employee_profiles')
          .select('branch')
          .eq('tenant_id', tenantId)
          .not('branch', 'is', null);
        
        console.log('Branches query result:', branchData, error);
        
        if (branchData && branchData.length > 0) {
          const uniqueBranches = [...new Set(branchData.map(e => e.branch).filter(Boolean))];
          console.log('Unique branches found:', uniqueBranches);
          setBranches(uniqueBranches.map(b => ({ 
            value: b!, 
            label: b!.charAt(0).toUpperCase() + b!.slice(1) // Capitalize first letter
          })));
        } else {
          console.log('No branches found, using default');
          setBranches([{ value: 'main', label: 'Main Branch' }]);
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setBranches([{ value: 'main', label: 'Main Branch' }]);
      }
      
      setBranchesLoading(false);
    };
    
    fetchBranches();
  }, [tenantId]);

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
    
    console.log('Starting staff signup process for:', { email, role, fullName, department, branch, tenantId });
    setLoading(true);

    const { error } = await signUp(email, password, fullName, department, role, branch, tenantId);
    
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
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
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
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select value={department} onValueChange={setDepartment} required disabled={departmentsLoading}>
            <SelectTrigger className="pl-10">
              {departmentsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading departments...</span>
                </div>
              ) : (
                <SelectValue placeholder={departments.length === 0 ? "No departments available" : "Select your department"} />
              )}
            </SelectTrigger>
            <SelectContent>
              {departments.length === 0 ? (
                <SelectItem value="general" disabled>
                  No departments configured yet
                </SelectItem>
              ) : (
                departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        {!tenantId && (
          <p className="text-xs text-muted-foreground">
            Access the signup page via your institution's link to see available departments.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff-branch">Branch</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select value={branch} onValueChange={setBranch} required disabled={branchesLoading}>
            <SelectTrigger className="pl-10">
              {branchesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading branches...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select your branch" />
              )}
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
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

      <div className="text-sm text-center text-muted-foreground bg-muted p-3 rounded-lg">
        <p className="font-medium text-foreground">Account Approval Required</p>
        <p>Your account will be reviewed by an administrator before activation. You will receive notification once approved.</p>
      </div>
    </form>
  );
};

export default StaffSignUpForm;
