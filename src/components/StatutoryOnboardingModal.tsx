import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import { Loader2, User, FileText, Phone, MapPin, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatutoryOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const StatutoryOnboardingModal = ({ isOpen, onComplete }: StatutoryOnboardingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isCorporate } = useTenantLabels();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_number: '',
    kra_pin: '',
    sha_number: '',
    nssf_number: '',
    tsc_number: '',
    birth_date: null as Date | null,
    gender: '',
    physical_address: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user session found. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.id_number || !formData.gender || !formData.birth_date) {
      toast({
        title: "Required Fields",
        description: "Please fill in ID Number, Gender, and Date of Birth.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.next_of_kin_name || !formData.next_of_kin_phone || !formData.next_of_kin_relationship) {
      toast({
        title: "Required Fields",
        description: "Please fill in all Next of Kin details.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        id_number: formData.id_number,
        kra_pin: formData.kra_pin || null,
        sha_number: formData.sha_number || null,
        nssf_number: formData.nssf_number || null,
        tsc_number: formData.tsc_number || null,
        birth_date: formData.birth_date ? format(formData.birth_date, 'yyyy-MM-dd') : null,
        gender: formData.gender,
        physical_address: formData.physical_address || null,
        next_of_kin_name: formData.next_of_kin_name,
        next_of_kin_phone: formData.next_of_kin_phone,
        next_of_kin_relationship: formData.next_of_kin_relationship,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Profile Completed",
          description: "Your statutory details have been saved successfully.",
        });
        onComplete();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please fill in your statutory and personal details to complete your account setup. This information is required for compliance purposes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-none bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_number">ID/Passport Number *</Label>
                <Input
                  id="id_number"
                  placeholder="Enter ID number"
                  value={formData.id_number}
                  onChange={(e) => handleInputChange('id_number', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)} required>
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
                        !formData.birth_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birth_date ? format(formData.birth_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.birth_date || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, birth_date: date || null }))}
                      disabled={(date) => date > new Date() || date < new Date('1940-01-01')}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear() - 16}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="physical_address">Physical Address</Label>
                <Input
                  id="physical_address"
                  placeholder="Enter your address"
                  value={formData.physical_address}
                  onChange={(e) => handleInputChange('physical_address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Statutory Compliance */}
          <Card className="border-0 shadow-none bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Statutory Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kra_pin">KRA PIN</Label>
                <Input
                  id="kra_pin"
                  placeholder="e.g., A012345678B"
                  value={formData.kra_pin}
                  onChange={(e) => handleInputChange('kra_pin', e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sha_number">SHA/SHIF Number</Label>
                <Input
                  id="sha_number"
                  placeholder="Enter SHA number"
                  value={formData.sha_number}
                  onChange={(e) => handleInputChange('sha_number', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nssf_number">NSSF Number</Label>
                <Input
                  id="nssf_number"
                  placeholder="Enter NSSF number"
                  value={formData.nssf_number}
                  onChange={(e) => handleInputChange('nssf_number', e.target.value)}
                />
              </div>

              {!isCorporate && (
                <div className="space-y-2">
                  <Label htmlFor="tsc_number">TSC Number</Label>
                  <Input
                    id="tsc_number"
                    placeholder="Enter TSC number"
                    value={formData.tsc_number}
                    onChange={(e) => handleInputChange('tsc_number', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next of Kin */}
          <Card className="border-0 shadow-none bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Next of Kin (Emergency Contact) *
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="next_of_kin_name">Full Name *</Label>
                <Input
                  id="next_of_kin_name"
                  placeholder="Enter full name"
                  value={formData.next_of_kin_name}
                  onChange={(e) => handleInputChange('next_of_kin_name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_of_kin_phone">Phone Number *</Label>
                <Input
                  id="next_of_kin_phone"
                  placeholder="+254..."
                  value={formData.next_of_kin_phone}
                  onChange={(e) => handleInputChange('next_of_kin_phone', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_of_kin_relationship">Relationship *</Label>
                <Select 
                  value={formData.next_of_kin_relationship} 
                  onValueChange={(value) => handleInputChange('next_of_kin_relationship', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="relative">Other Relative</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StatutoryOnboardingModal;
