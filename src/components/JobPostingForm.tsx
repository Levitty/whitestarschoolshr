
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobListings } from '@/hooks/useJobListings';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface JobPostingFormProps {
  onSuccess: () => void;
}

export const JobPostingForm = ({ onSuccess }: JobPostingFormProps) => {
  const { createJobListing } = useJobListings();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    department: '',
    location: '',
    employment_type: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Job posting form submission started');
    console.log('Current user:', user);
    console.log('Current profile:', profile);

    // Check authentication
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Authentication Required",
        description: "Please log in to create job postings",
        variant: "destructive"
      });
      return;
    }

    // Check admin permissions
    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      console.error('User does not have admin permissions:', profile?.role);
      toast({
        title: "Access Denied",
        description: "Only administrators can create job postings",
        variant: "destructive"
      });
      return;
    }
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.department || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating job listing with data:', formData);
      const result = await createJobListing({
        ...formData,
        status: 'Open'
      });
      
      console.log('Job listing created successfully:', result);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        department: '',
        location: '',
        employment_type: 'Full-time'
      });
      
      toast({
        title: "Success",
        description: "Job posting created successfully!"
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job posting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show message if user is not authenticated or not admin
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to create job postings.</p>
      </div>
    );
  }

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Only administrators can create job postings.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Senior Developer"
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            placeholder="e.g., Engineering"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed job description..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
          placeholder="e.g., 5+ years of experience in software development, Bachelor's degree in Computer Science..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., New York, NY"
            required
          />
        </div>
        <div>
          <Label htmlFor="employment_type">Employment Type</Label>
          <Select
            value={formData.employment_type}
            onValueChange={(value: 'Full-time' | 'Part-time' | 'Contract') => 
              setFormData(prev => ({ ...prev, employment_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Job Posting'}
      </Button>
    </form>
  );
};
