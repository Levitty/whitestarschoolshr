import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Users,
  Target,
  Star,
  Info
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCorporateEvaluations, CorporateEvaluationInsert } from '@/hooks/useCorporateEvaluations';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateCorporateEvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATING_LABELS = [
  { value: 1, label: 'Unsatisfactory', color: 'text-red-500' },
  { value: 2, label: 'Needs Improvement', color: 'text-orange-500' },
  { value: 3, label: 'Meets Expectations', color: 'text-yellow-500' },
  { value: 4, label: 'Exceeds Expectations', color: 'text-emerald-500' },
  { value: 5, label: 'Exceptional', color: 'text-green-600' },
];

const getRatingLabel = (value: number) => {
  return RATING_LABELS.find(r => r.value === Math.round(value)) || RATING_LABELS[2];
};

const CreateCorporateEvaluationForm = ({ isOpen, onClose }: CreateCorporateEvaluationFormProps) => {
  const { employees } = useEmployees();
  const { createEvaluation } = useCorporateEvaluations();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    employee_id: '',
    period: '',
    evaluation_type: 'quarterly' as 'quarterly' | 'annual' | 'probation',
    technical_skills: 3,
    quality_of_work: 3,
    productivity: 3,
    communication: 3,
    teamwork: 3,
    technical_skills_comments: '',
    quality_of_work_comments: '',
    productivity_comments: '',
    communication_comments: '',
    teamwork_comments: '',
    strengths: '',
    improvement_areas: '',
    goals: '',
    status: 'draft' as 'draft' | 'submitted' | 'approved',
  });

  const handleSubmit = async (e: React.FormEvent, saveAs: 'draft' | 'submitted') => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.period || !user?.id) {
      return;
    }

    const evaluationData: CorporateEvaluationInsert = {
      employee_id: formData.employee_id,
      evaluator_id: user.id,
      period: formData.period,
      evaluation_type: formData.evaluation_type,
      technical_skills: formData.technical_skills,
      quality_of_work: formData.quality_of_work,
      productivity: formData.productivity,
      communication: formData.communication,
      teamwork: formData.teamwork,
      technical_skills_comments: formData.technical_skills_comments || null,
      quality_of_work_comments: formData.quality_of_work_comments || null,
      productivity_comments: formData.productivity_comments || null,
      communication_comments: formData.communication_comments || null,
      teamwork_comments: formData.teamwork_comments || null,
      strengths: formData.strengths || null,
      improvement_areas: formData.improvement_areas || null,
      goals: formData.goals || null,
      status: saveAs,
    };

    await createEvaluation.mutateAsync(evaluationData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      period: '',
      evaluation_type: 'quarterly',
      technical_skills: 3,
      quality_of_work: 3,
      productivity: 3,
      communication: 3,
      teamwork: 3,
      technical_skills_comments: '',
      quality_of_work_comments: '',
      productivity_comments: '',
      communication_comments: '',
      teamwork_comments: '',
      strengths: '',
      improvement_areas: '',
      goals: '',
      status: 'draft',
    });
  };

  const overallRating = (
    formData.technical_skills +
    formData.quality_of_work +
    formData.productivity +
    formData.communication +
    formData.teamwork
  ) / 5;

  const CriteriaSlider = ({ 
    icon: Icon, 
    label, 
    value, 
    onChange, 
    comments, 
    onCommentsChange,
    description 
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    onChange: (value: number) => void;
    comments: string;
    onCommentsChange: (value: string) => void;
    description: string;
  }) => {
    const ratingLabel = getRatingLabel(value);
    
    return (
      <Card className="border border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{value.toFixed(1)}</span>
              <Badge variant="outline" className={ratingLabel.color}>
                {ratingLabel.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={1}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 - Unsatisfactory</span>
            <span>3 - Meets</span>
            <span>5 - Exceptional</span>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Comments (optional)</Label>
            <Textarea
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              placeholder={`Specific feedback on ${label.toLowerCase()}...`}
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Create Corporate Performance Evaluation
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(e => e.status === 'active')
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.position}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Evaluation Period *</Label>
                <Input
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="e.g., Q1 2026, Annual 2025"
                />
              </div>

              <div>
                <Label>Evaluation Type *</Label>
                <Select
                  value={formData.evaluation_type}
                  onValueChange={(value: 'quarterly' | 'annual' | 'probation') => 
                    setFormData({ ...formData, evaluation_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly Review</SelectItem>
                    <SelectItem value="annual">Annual Review</SelectItem>
                    <SelectItem value="probation">Probation Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rating Guide */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Rating Scale Guide</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {RATING_LABELS.map((rating) => (
                  <div key={rating.value} className="text-center p-2 bg-background rounded">
                    <div className="font-bold text-lg">{rating.value}</div>
                    <div className={rating.color}>{rating.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Criteria */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Performance Criteria</h3>
            
            <CriteriaSlider
              icon={Briefcase}
              label="Technical Skills / Job Knowledge"
              value={formData.technical_skills}
              onChange={(v) => setFormData({ ...formData, technical_skills: v })}
              comments={formData.technical_skills_comments}
              onCommentsChange={(v) => setFormData({ ...formData, technical_skills_comments: v })}
              description="Demonstrates expertise in job-related skills, stays current with industry knowledge, applies technical skills effectively."
            />

            <CriteriaSlider
              icon={CheckCircle}
              label="Quality of Work"
              value={formData.quality_of_work}
              onChange={(v) => setFormData({ ...formData, quality_of_work: v })}
              comments={formData.quality_of_work_comments}
              onCommentsChange={(v) => setFormData({ ...formData, quality_of_work_comments: v })}
              description="Produces accurate, thorough work, maintains high standards, attention to detail, minimal errors."
            />

            <CriteriaSlider
              icon={Clock}
              label="Productivity / Meeting Deadlines"
              value={formData.productivity}
              onChange={(v) => setFormData({ ...formData, productivity: v })}
              comments={formData.productivity_comments}
              onCommentsChange={(v) => setFormData({ ...formData, productivity_comments: v })}
              description="Completes tasks on time, manages workload effectively, prioritizes appropriately, efficient use of time."
            />

            <CriteriaSlider
              icon={MessageSquare}
              label="Communication"
              value={formData.communication}
              onChange={(v) => setFormData({ ...formData, communication: v })}
              comments={formData.communication_comments}
              onCommentsChange={(v) => setFormData({ ...formData, communication_comments: v })}
              description="Communicates clearly and professionally, listens actively, provides timely updates, writes effectively."
            />

            <CriteriaSlider
              icon={Users}
              label="Teamwork & Collaboration"
              value={formData.teamwork}
              onChange={(v) => setFormData({ ...formData, teamwork: v })}
              comments={formData.teamwork_comments}
              onCommentsChange={(v) => setFormData({ ...formData, teamwork_comments: v })}
              description="Works well with others, contributes to team goals, shares knowledge, supports colleagues."
            />
          </div>

          {/* Overall Rating Display */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Overall Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">{overallRating.toFixed(1)}</span>
                  <Badge className={getRatingLabel(overallRating).color}>
                    {getRatingLabel(overallRating).label}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Calculated as the average of all five criteria
              </p>
            </CardContent>
          </Card>

          {/* Summary Fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Summary & Development</h3>
            
            <div>
              <Label>Key Strengths</Label>
              <Textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder="What does this employee do particularly well?"
                rows={3}
              />
            </div>

            <div>
              <Label>Areas for Improvement</Label>
              <Textarea
                value={formData.improvement_areas}
                onChange={(e) => setFormData({ ...formData, improvement_areas: e.target.value })}
                placeholder="What areas need development or improvement?"
                rows={3}
              />
            </div>

            <div>
              <Label>Goals for Next Period</Label>
              <Textarea
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="What specific, measurable goals should be achieved?"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={!formData.employee_id || !formData.period || createEvaluation.isPending}
            >
              Save as Draft
            </Button>
            <Button 
              type="button"
              onClick={(e) => handleSubmit(e, 'submitted')}
              disabled={!formData.employee_id || !formData.period || createEvaluation.isPending}
            >
              Submit Evaluation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCorporateEvaluationForm;
