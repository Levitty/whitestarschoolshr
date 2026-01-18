import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  Star,
  User,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Printer,
  Download
} from 'lucide-react';
import { CorporateEvaluation } from '@/hooks/useCorporateEvaluations';
import { format } from 'date-fns';

interface CorporateEvaluationDetailProps {
  evaluation: CorporateEvaluation;
  onClose: () => void;
}

const CRITERIA = [
  { 
    key: 'technical_skills', 
    label: 'Technical Skills / Job Knowledge', 
    icon: Briefcase,
    color: 'bg-blue-500'
  },
  { 
    key: 'quality_of_work', 
    label: 'Quality of Work', 
    icon: CheckCircle,
    color: 'bg-emerald-500'
  },
  { 
    key: 'productivity', 
    label: 'Productivity / Meeting Deadlines', 
    icon: Clock,
    color: 'bg-violet-500'
  },
  { 
    key: 'communication', 
    label: 'Communication', 
    icon: MessageSquare,
    color: 'bg-amber-500'
  },
  { 
    key: 'teamwork', 
    label: 'Teamwork & Collaboration', 
    icon: Users,
    color: 'bg-rose-500'
  },
];

const getRatingLabel = (value: number) => {
  if (value >= 4.5) return { label: 'Exceptional', color: 'text-green-600 bg-green-100' };
  if (value >= 3.5) return { label: 'Exceeds Expectations', color: 'text-emerald-600 bg-emerald-100' };
  if (value >= 2.5) return { label: 'Meets Expectations', color: 'text-yellow-600 bg-yellow-100' };
  if (value >= 1.5) return { label: 'Needs Improvement', color: 'text-orange-600 bg-orange-100' };
  return { label: 'Unsatisfactory', color: 'text-red-600 bg-red-100' };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-500">Submitted</Badge>;
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const CorporateEvaluationDetail = ({ evaluation, onClose }: CorporateEvaluationDetailProps) => {
  const overallRating = evaluation.overall_rating || 0;
  const ratingInfo = getRatingLabel(overallRating);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Performance Evaluation
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Header Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {evaluation.employee?.first_name} {evaluation.employee?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.employee?.position} • {evaluation.employee?.department}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Period:</span>
                      <p className="font-medium">{evaluation.period}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{evaluation.evaluation_type} Review</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Evaluator:</span>
                      <p className="font-medium">
                        {evaluation.evaluator?.first_name} {evaluation.evaluator?.last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">
                        {format(new Date(evaluation.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground mb-2">Overall Rating</span>
                  <div className="text-5xl font-bold text-primary mb-2">
                    {overallRating.toFixed(1)}
                  </div>
                  <Badge className={`text-sm ${ratingInfo.color}`}>
                    {ratingInfo.label}
                  </Badge>
                  <div className="mt-2">
                    {getStatusBadge(evaluation.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Performance Criteria Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {CRITERIA.map((criterion) => {
                const value = evaluation[criterion.key as keyof CorporateEvaluation] as number || 0;
                const comments = evaluation[`${criterion.key}_comments` as keyof CorporateEvaluation] as string;
                const Icon = criterion.icon;
                const percentage = (value / 5) * 100;

                return (
                  <div key={criterion.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{criterion.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{value.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    {comments && (
                      <p className="text-sm text-muted-foreground pl-6 italic">
                        "{comments}"
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {evaluation.strengths && (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{evaluation.strengths}</p>
                </CardContent>
              </Card>
            )}

            {evaluation.improvement_areas && (
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <TrendingDown className="h-4 w-4" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{evaluation.improvement_areas}</p>
                </CardContent>
              </Card>
            )}

            {evaluation.goals && (
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Target className="h-4 w-4" />
                    Goals for Next Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{evaluation.goals}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Performance Rating Scale Legend */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground mb-2">Rating Scale Reference</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-green-600">5 - Exceptional</Badge>
                <Badge variant="outline" className="text-emerald-600">4 - Exceeds Expectations</Badge>
                <Badge variant="outline" className="text-yellow-600">3 - Meets Expectations</Badge>
                <Badge variant="outline" className="text-orange-600">2 - Needs Improvement</Badge>
                <Badge variant="outline" className="text-red-600">1 - Unsatisfactory</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CorporateEvaluationDetail;
