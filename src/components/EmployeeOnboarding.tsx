import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, User, Phone, CreditCard, Calendar, MapPin, Users } from 'lucide-react';

const EmployeeOnboarding = () => {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    id_number: '',
    kra_pin: '',
    birth_date: '',
    gender: '',
    sha_number: '',
    nssf_number: '',
    tsc_number: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
    physical_address: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('No user found');
      return;
    }

    // All fields are now optional - no validation required

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          id_number: formData.id_number,
          kra_pin: formData.kra_pin || null,
          birth_date: formData.birth_date,
          gender: formData.gender,
          sha_number: formData.sha_number || null,
          nssf_number: formData.nssf_number || null,
          tsc_number: formData.tsc_number || null,
          next_of_kin_name: formData.next_of_kin_name,
          next_of_kin_phone: formData.next_of_kin_phone,
          next_of_kin_relationship: formData.next_of_kin_relationship || null,
          physical_address: formData.physical_address,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      await fetchProfile();
      navigate('/');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Please fill in your employment details to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="id_number">ID Number</Label>
                  <Input
                    id="id_number"
                    placeholder="National ID Number"
                    value={formData.id_number}
                    onChange={(e) => handleInputChange('id_number', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Date of Birth</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="physical_address">Physical Address</Label>
                <Textarea
                  id="physical_address"
                  placeholder="Enter your physical address"
                  value={formData.physical_address}
                  onChange={(e) => handleInputChange('physical_address', e.target.value)}
                />
              </div>
            </div>

            {/* Statutory Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CreditCard className="h-5 w-5" />
                <span>Statutory Information</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kra_pin">KRA PIN</Label>
                  <Input
                    id="kra_pin"
                    placeholder="e.g., A123456789B"
                    value={formData.kra_pin}
                    onChange={(e) => handleInputChange('kra_pin', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sha_number">SHA Number</Label>
                  <Input
                    id="sha_number"
                    placeholder="Social Health Authority Number"
                    value={formData.sha_number}
                    onChange={(e) => handleInputChange('sha_number', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nssf_number">NSSF Number</Label>
                  <Input
                    id="nssf_number"
                    placeholder="NSSF Number"
                    value={formData.nssf_number}
                    onChange={(e) => handleInputChange('nssf_number', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tsc_number">TSC Number</Label>
                  <Input
                    id="tsc_number"
                    placeholder="TSC Number (if applicable)"
                    value={formData.tsc_number}
                    onChange={(e) => handleInputChange('tsc_number', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Next of Kin */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Users className="h-5 w-5" />
                <span>Next of Kin Details</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next_of_kin_name">Name</Label>
                  <Input
                    id="next_of_kin_name"
                    placeholder="Full name"
                    value={formData.next_of_kin_name}
                    onChange={(e) => handleInputChange('next_of_kin_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="next_of_kin_phone">Phone Number</Label>
                  <Input
                    id="next_of_kin_phone"
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={formData.next_of_kin_phone}
                    onChange={(e) => handleInputChange('next_of_kin_phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="next_of_kin_relationship">Relationship</Label>
                  <Select value={formData.next_of_kin_relationship} onValueChange={(value) => handleInputChange('next_of_kin_relationship', value)}>
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
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeOnboarding;
