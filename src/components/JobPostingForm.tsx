
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobListings } from '@/hooks/useJobListings';

interface JobPostingFormProps {
  onSuccess: () => void;
}

export const JobPostingForm = ({ onSuccess }: JobPostingFormProps) => {
  const { createJobListing } = useJobListings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    employment_type: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.department || !formData.location) {
      return;
    }

    setLoading(true);
    try {
      await createJobListing({
        ...formData,
        status: 'Open'
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating job posting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Senior Developer"
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
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
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed job description..."
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
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
