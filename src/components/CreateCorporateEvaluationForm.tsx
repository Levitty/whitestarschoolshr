import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Star, User, Building, Briefcase } from 'lucide-react';

interface CreateCorporateEvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployeeId?: string;
}

const CreateCorporateEvaluationForm = ({ isOpen, onClose, selectedEmployeeId }: CreateCorporateEvaluationFormProps) => {
  const { employees } = useEmployees();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { tenant } = useTenant();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: selectedEmployeeId || '',
    period: '',
    evaluation_type: 'quarterly',
    // Corporate 5-point scale criteria
    technical_skills: 3,
    technical_skills_comments: '',
    quality_of_work: 3,
    quality_of_work_comments: '',
    productivity: 3,
    productivity_comments: '',
    communication: 3,
    communication_comments: '',
    teamwork: 3,
    teamwork_comments: '',
    // Overall
    strengths: '',
    improvement_areas: '',
    goals: ''
  });

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [field]: value[0] }));
  };

  const calculateOverallRating = () => {
    const ratings = [
      formData.technical_skills,
      formData.quality_of_work,
      formData.productivity,
      formData.communication,
      formData.teamwork
    ];
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.period) {
      toast({
        title: "Validation Error",
        description: "Please select an employee and enter the evaluation period.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('corporate_evaluations')
        .insert({
          employee_id: formData.employee_id,
          evaluator_id: profile?.id,
          tenant_id: tenant?.id,
          period: formData.period,
          evaluation_type: formData.evaluation_type,
          technical_skills: formData.technical_skills,
          technical_skills_comments: formData.technical_skills_comments || null,
          quality_of_work: formData.quality_of_work,
          quality_of_work_comments: formData.quality_of_work_comments || null,
          productivity: formData.productivity,
          productivity_comments: formData.productivity_comments || null,
          communication: formData.communication,
          communication_comments: formData.communication_comments || null,
          teamwork: formData.teamwork,
          teamwork_comments: formData.teamwork_comments || null,
          strengths: formData.strengths || null,
          improvement_areas: formData.improvement_areas || null,
          goals: formData.goals || null,
          overall_rating: parseFloat(calculateOverallRating()),
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Evaluation Created",
        description: "Corporate evaluation has been created successfully."
      });

      onClose();
      
      // Reset form
      setFormData({
        employee_id: selectedEmployeeId || '',
        period: '',
        evaluation_type: 'quarterly',
        technical_skills: 3,
        technical_skills_comments: '',
        quality_of_work: 3,
        quality_of_work_comments: '',
        productivity: 3,
        productivity_comments: '',
        communication: 3,
        communication_comments: '',
        teamwork: 3,
        teamwork_comments: '',
        strengths: '',
        improvement_areas: '',
        goals: ''
      });
    } catch (error: any) {
      console.error('Error creating evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to create evaluation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === formData.employee_id);

  const RatingSlider = ({ 
    field, 
    label, 
    commentsField 
  }: { 
    field: string; 
    label: string; 
    commentsField: string;
  }) => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-bold text-primary">
          {formData[field as keyof typeof formData]}/5
        </span>
      </div>
      <Slider
        value={[formData[field as keyof typeof formData] as number]}
        onValueChange={(value) => handleSliderChange(field, value)}
        max={5}
        min={1}
        step={0.5}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Needs Improvement (1)</span>
        <span>Meets Expectations (3)</span>
        <span>Exceeds (5)</span>
      </div>
      <Textarea
        value={formData[commentsField as keyof typeof formData] as string}
        onChange={(e) => setFormData(prev => ({ ...prev, [commentsField]: e.target.value }))}
        placeholder={`Comments for ${label.toLowerCase()}...`}
        rows={2}
        className="mt-2"
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Corporate Performance Evaluation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee Name *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                  disabled={!!selectedEmployeeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Position</Label>
                <Input value={selectedEmployee?.position || ''} disabled />
              </div>

              <div>
                <Label>Department</Label>
                <Input value={selectedEmployee?.department || ''} disabled />
              </div>

              <div>
                <Label>Evaluator</Label>
                <Input value={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()} disabled />
              </div>

              <div>
                <Label htmlFor="period">Evaluation Period *</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="e.g., Q1 2026, January 2026"
                />
              </div>

              <div>
                <Label htmlFor="evaluation_type">Evaluation Type</Label>
                <Select
                  value={formData.evaluation_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, evaluation_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Review</SelectItem>
                    <SelectItem value="quarterly">Quarterly Review</SelectItem>
                    <SelectItem value="annual">Annual Review</SelectItem>
                    <SelectItem value="probation">Probation Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Performance Criteria */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Performance Criteria (5-Point Scale)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RatingSlider 
                field="technical_skills"
                label="Technical Skills / Job Knowledge"
                commentsField="technical_skills_comments"
              />
              
              <RatingSlider 
                field="quality_of_work"
                label="Quality of Work"
                commentsField="quality_of_work_comments"
              />
              
              <RatingSlider 
                field="productivity"
                label="Productivity / Meeting Deadlines"
                commentsField="productivity_comments"
              />
              
              <RatingSlider 
                field="communication"
                label="Communication Skills"
                commentsField="communication_comments"
              />
              
              <RatingSlider 
                field="teamwork"
                label="Teamwork & Collaboration"
                commentsField="teamwork_comments"
              />
            </CardContent>
          </Card>

          {/* Overall Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <Label className="text-sm text-muted-foreground">Overall Rating</Label>
                <p className="text-3xl font-bold text-primary">{calculateOverallRating()} / 5.0</p>
              </div>

              <div>
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="Highlight the employee's key strengths..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="improvement_areas">Areas for Improvement</Label>
                <Textarea
                  id="improvement_areas"
                  value={formData.improvement_areas}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvement_areas: e.target.value }))}
                  placeholder="Identify areas where the employee can improve..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals">Goals for Next Period</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="Set specific goals for the next evaluation period..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Evaluation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCorporateEvaluationForm;
