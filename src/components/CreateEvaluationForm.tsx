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
import { useEvaluations } from '@/hooks/useEvaluations';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { Star, User, Calendar, Building } from 'lucide-react';

// Evaluation category configs per tenant type
const SCHOOL_EVALUATION_CATEGORIES = [
  {
    title: 'Academic Achievement (20%)',
    prefix: 'academic',
    criteria: [
      { key: 'academic_student_performance', label: 'Student Performance Improvement' },
      { key: 'academic_teaching_strategies', label: 'Effective Teaching Strategies' },
      { key: 'academic_slow_learners', label: 'Improvement on Slow Learners' },
      { key: 'academic_initiatives', label: 'Academic Initiatives' },
    ],
  },
  {
    title: 'School Culture (20%)',
    prefix: 'culture',
    criteria: [
      { key: 'culture_mission_support', label: 'Support for Mission/Vision' },
      { key: 'culture_extracurricular', label: 'Extracurricular Engagement' },
      { key: 'culture_collaboration', label: 'Collaboration with Colleagues' },
      { key: 'culture_diversity', label: 'Diversity & Inclusion' },
    ],
  },
  {
    title: 'Teacher Professional Development (20%)',
    prefix: 'development',
    criteria: [
      { key: 'development_workshops', label: 'Workshops & Seminars Attendance' },
      { key: 'development_education', label: 'Further Education Pursuit' },
      { key: 'development_methodologies', label: 'New Teaching Methodologies' },
      { key: 'development_mentoring', label: 'Peer Mentoring & Support' },
    ],
  },
  {
    title: 'Customer Relationship (20%)',
    prefix: 'customer',
    criteria: [
      { key: 'customer_responsiveness', label: 'Responsiveness to Inquiries' },
      { key: 'customer_communication', label: 'Open Communication' },
      { key: 'customer_feedback', label: 'Feedback Incorporation' },
      { key: 'customer_conflict_resolution', label: 'Conflict Resolution' },
    ],
  },
];

const CORPORATE_EVALUATION_CATEGORIES = [
  {
    title: 'Job Performance & Productivity (25%)',
    prefix: 'academic',
    criteria: [
      { key: 'academic_student_performance', label: 'Task Completion & Quality' },
      { key: 'academic_teaching_strategies', label: 'Efficiency & Time Management' },
      { key: 'academic_slow_learners', label: 'Problem Solving & Adaptability' },
      { key: 'academic_initiatives', label: 'Innovation & Initiative' },
    ],
  },
  {
    title: 'Company Culture & Teamwork (25%)',
    prefix: 'culture',
    criteria: [
      { key: 'culture_mission_support', label: 'Alignment with Company Values' },
      { key: 'culture_extracurricular', label: 'Team Activities & Engagement' },
      { key: 'culture_collaboration', label: 'Cross-Department Collaboration' },
      { key: 'culture_diversity', label: 'Inclusivity & Respect' },
    ],
  },
  {
    title: 'Professional Growth & Development (25%)',
    prefix: 'development',
    criteria: [
      { key: 'development_workshops', label: 'Training & Certifications' },
      { key: 'development_education', label: 'Skills Development' },
      { key: 'development_methodologies', label: 'Adopting Best Practices' },
      { key: 'development_mentoring', label: 'Knowledge Sharing & Mentoring' },
    ],
  },
  {
    title: 'Customer & Client Relations (25%)',
    prefix: 'customer',
    criteria: [
      { key: 'customer_responsiveness', label: 'Client Responsiveness' },
      { key: 'customer_communication', label: 'Clear Communication' },
      { key: 'customer_feedback', label: 'Client Satisfaction & Feedback' },
      { key: 'customer_conflict_resolution', label: 'Issue Resolution' },
    ],
  },
];

interface CreateEvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployeeId?: string;
}

interface CreateEvaluationData {
  employee_id: string;
  evaluator_id: string;
  period: string;
  type: string;
  branch: string;
  academic_student_performance: number;
  academic_teaching_strategies: number;
  academic_slow_learners: number;
  academic_initiatives: number;
  academic_comments?: string;
  culture_mission_support: number;
  culture_extracurricular: number;
  culture_collaboration: number;
  culture_diversity: number;
  culture_comments?: string;
  development_workshops: number;
  development_education: number;
  development_methodologies: number;
  development_mentoring: number;
  development_comments?: string;
  customer_responsiveness: number;
  customer_communication: number;
  customer_feedback: number;
  customer_conflict_resolution: number;
  customer_comments?: string;
  status?: string;
}

const CreateEvaluationForm = ({ isOpen, onClose, selectedEmployeeId }: CreateEvaluationFormProps) => {
  const { createEvaluation } = useEvaluations();
  const { employees } = useEmployees();
  const { profile } = useAuth();
  const { tenant } = useTenant();

  const isCorporate = tenant?.tenant_type === 'corporate';
  const evaluationCategories = isCorporate ? CORPORATE_EVALUATION_CATEGORIES : SCHOOL_EVALUATION_CATEGORIES;
  
  const [formData, setFormData] = useState({
    employee_id: selectedEmployeeId || '',
    period: '',
    type: 'Annual Review',
    branch: '',
    // Academic Achievement
    academic_student_performance: 3,
    academic_teaching_strategies: 3,
    academic_slow_learners: 3,
    academic_initiatives: 3,
    academic_comments: '',
    // School Culture
    culture_mission_support: 3,
    culture_extracurricular: 3,
    culture_collaboration: 3,
    culture_diversity: 3,
    culture_comments: '',
    // Professional Development
    development_workshops: 3,
    development_education: 3,
    development_methodologies: 3,
    development_mentoring: 3,
    development_comments: '',
    // Customer Relationship
    customer_responsiveness: 3,
    customer_communication: 3,
    customer_feedback: 3,
    customer_conflict_resolution: 3,
    customer_comments: ''
  });

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.period || !formData.branch) {
      return;
    }

    const evaluationData: CreateEvaluationData = {
      ...formData,
      evaluator_id: profile?.id || '',
      status: 'draft'
    };

    console.log('Submitting evaluation data:', evaluationData);
    const result = await createEvaluation(evaluationData);
    if (result) {
      onClose();
      setFormData({
        employee_id: selectedEmployeeId || '',
        period: '',
        type: 'Annual Review',
        branch: '',
        academic_student_performance: 3,
        academic_teaching_strategies: 3,
        academic_slow_learners: 3,
        academic_initiatives: 3,
        academic_comments: '',
        culture_mission_support: 3,
        culture_extracurricular: 3,
        culture_collaboration: 3,
        culture_diversity: 3,
        culture_comments: '',
        development_workshops: 3,
        development_education: 3,
        development_methodologies: 3,
        development_mentoring: 3,
        development_comments: '',
        customer_responsiveness: 3,
        customer_communication: 3,
        customer_feedback: 3,
        customer_conflict_resolution: 3,
        customer_comments: ''
      });
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === formData.employee_id);

  const SliderSection = ({ title, criteria, prefix, comments }: {
    title: string;
    criteria: { key: string; label: string }[];
    prefix: string;
    comments: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">{criterion.label}</Label>
              <span className="text-sm font-bold text-blue-600">
                {formData[criterion.key as keyof typeof formData]}/5
              </span>
            </div>
            <Slider
              value={[formData[criterion.key as keyof typeof formData] as number]}
              onValueChange={(value) => handleSliderChange(criterion.key, value)}
              max={5}
              min={1}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor (1)</span>
              <span>Excellent (5)</span>
            </div>
          </div>
        ))}
        <div className="space-y-2">
          <Label>Comments & Feedback</Label>
          <Textarea
            value={formData[`${prefix}_comments` as keyof typeof formData] as string}
            onChange={(e) => setFormData(prev => ({ ...prev, [`${prefix}_comments`]: e.target.value }))}
            placeholder={`Provide detailed feedback for ${title.toLowerCase()}...`}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {isCorporate ? 'Create Employee Evaluation' : 'Create Teacher Evaluation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section A: Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">{isCorporate ? 'Employee Name' : 'Teacher Name'} *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                  disabled={!!selectedEmployeeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isCorporate ? 'Select employee' : 'Select teacher'} />
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
                <Label>Job Title</Label>
                <Input value={selectedEmployee?.position || (isCorporate ? 'Employee' : 'Teacher')} disabled />
              </div>

              <div>
                <Label>Department</Label>
                <Input value={selectedEmployee?.department || ''} disabled />
              </div>

              <div>
                <Label>Supervisor</Label>
                <Input value={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()} disabled />
              </div>

              <div>
                <Label htmlFor="period">Evaluation Period *</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  placeholder={isCorporate ? 'e.g., Q1 2026, Annual 2026' : 'e.g., Term 1 2024, Annual 2024'}
                />
              </div>

              <div>
                <Label htmlFor="branch">{isCorporate ? 'Branch/Location' : 'Branch/School'} *</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder={isCorporate ? 'e.g., Main Branch, Village Market' : 'e.g., Main Campus, Secondary Branch'}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Evaluation Areas — dynamically rendered based on tenant type */}
          <div className="space-y-6">
            {evaluationCategories.map((category) => (
              <SliderSection
                key={category.prefix}
                title={category.title}
                prefix={category.prefix}
                comments={formData[`${category.prefix}_comments` as keyof typeof formData] as string}
                criteria={category.criteria}
              />
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Evaluation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEvaluationForm;
