import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Loader2, User, Shield, Phone, Save, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileData {
  id_number: string;
  gender: string;
  birth_date: string;
  physical_address: string;
  phone: string;
  kra_pin: string;
  shif_number: string;
  nssf_number: string;
  tsc_number: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
}

interface EmployeeData {
  employee_number: string;
  position: string;
  department: string;
  branch: string;
  hire_date: string;
  status: string;
}

const MyProfile = () => {
  const { user, profile } = useAuth();
  const { tenant } = useTenant();
  const { isCorporate } = useTenantLabels();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    id_number: '',
    gender: '',
    birth_date: '',
    physical_address: '',
    phone: '',
    kra_pin: '',
    shif_number: '', // UI label is SHA/SHIF, db column is sha_number
    nssf_number: '',
    tsc_number: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
  });
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [birthDate, setBirthDate] = useState<Date | undefined>();

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setFormData({
          id_number: profileData.id_number || '',
          gender: profileData.gender || '',
          birth_date: profileData.birth_date || '',
          physical_address: profileData.physical_address || '',
          phone: profileData.phone || '',
          kra_pin: profileData.kra_pin || '',
          shif_number: profileData.sha_number || '', // db column is sha_number
          nssf_number: profileData.nssf_number || '',
          tsc_number: profileData.tsc_number || '',
          next_of_kin_name: profileData.next_of_kin_name || '',
          next_of_kin_phone: profileData.next_of_kin_phone || '',
          next_of_kin_relationship: profileData.next_of_kin_relationship || '',
        });
        
        if (profileData.birth_date) {
          setBirthDate(parseISO(profileData.birth_date));
        }
      }

      // Fetch employee data if exists
      const { data: empData } = await supabase
        .from('employee_profiles')
        .select('employee_number, position, department, branch, hire_date, status')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (empData) {
        setEmployeeData(empData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      setFormData(prev => ({ ...prev, birth_date: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          id_number: formData.id_number,
          gender: formData.gender,
          birth_date: formData.birth_date || null,
          physical_address: formData.physical_address,
          phone: formData.phone,
          kra_pin: formData.kra_pin,
          sha_number: formData.shif_number, // db column is sha_number
          nssf_number: formData.nssf_number,
          tsc_number: formData.tsc_number,
          next_of_kin_name: formData.next_of_kin_name,
          next_of_kin_phone: formData.next_of_kin_phone,
          next_of_kin_relationship: formData.next_of_kin_relationship,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal and statutory information</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your basic account details (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <Input value={profile?.email || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Full Name</Label>
            <Input 
              value={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.full_name || ''} 
              disabled 
              className="bg-muted" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Role</Label>
            <Input value={profile?.role || ''} disabled className="bg-muted capitalize" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Status</Label>
            <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
              {profile?.status || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Employee Information (if exists) */}
      {employeeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Employment Details
            </CardTitle>
            <CardDescription>Your employment information (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Employee Number</Label>
              <Input value={employeeData.employee_number || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Position</Label>
              <Input value={employeeData.position || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Department</Label>
              <Input value={employeeData.department || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Branch</Label>
              <Input value={employeeData.branch || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Hire Date</Label>
              <Input value={employeeData.hire_date || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Status</Label>
              <Badge variant={employeeData.status === 'active' ? 'default' : 'secondary'}>
                {employeeData.status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_number">ID/Passport Number *</Label>
            <Input 
              id="id_number"
              value={formData.id_number}
              onChange={(e) => handleInputChange('id_number', e.target.value)}
              placeholder="Enter ID or passport number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date of Birth *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date() || date < new Date("1940-01-01")}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="physical_address">Physical Address *</Label>
            <Textarea 
              id="physical_address"
              value={formData.physical_address}
              onChange={(e) => handleInputChange('physical_address', e.target.value)}
              placeholder="Enter your physical address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statutory Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statutory Compliance
          </CardTitle>
          <CardDescription>Your statutory registration numbers</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kra_pin">KRA PIN *</Label>
            <Input 
              id="kra_pin"
              value={formData.kra_pin}
              onChange={(e) => handleInputChange('kra_pin', e.target.value.toUpperCase())}
              placeholder="Enter KRA PIN"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shif_number">SHA/SHIF Number *</Label>
            <Input 
              id="shif_number"
              value={formData.shif_number}
              onChange={(e) => handleInputChange('shif_number', e.target.value)}
              placeholder="Enter SHA/SHIF number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nssf_number">NSSF Number *</Label>
            <Input 
              id="nssf_number"
              value={formData.nssf_number}
              onChange={(e) => handleInputChange('nssf_number', e.target.value)}
              placeholder="Enter NSSF number"
            />
          </div>
          {/* Show TSC for non-corporate tenants */}
          {!isCorporate && (
            <div className="space-y-2">
              <Label htmlFor="tsc_number">TSC Number</Label>
              <Input 
                id="tsc_number"
                value={formData.tsc_number}
                onChange={(e) => handleInputChange('tsc_number', e.target.value)}
                placeholder="Enter TSC number"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>Next of kin information for emergencies</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="next_of_kin_name">Next of Kin Name *</Label>
            <Input 
              id="next_of_kin_name"
              value={formData.next_of_kin_name}
              onChange={(e) => handleInputChange('next_of_kin_name', e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_of_kin_phone">Next of Kin Phone *</Label>
            <Input 
              id="next_of_kin_phone"
              value={formData.next_of_kin_phone}
              onChange={(e) => handleInputChange('next_of_kin_phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_of_kin_relationship">Relationship *</Label>
            <Select 
              value={formData.next_of_kin_relationship} 
              onValueChange={(value) => handleInputChange('next_of_kin_relationship', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default MyProfile;
