import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Printer, 
  Star, 
  Calendar, 
  User, 
  Target,
  TrendingUp,
  Award,
  Users,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantLabels, isSalesCommissionEvaluation } from '@/hooks/useTenantLabels';
import CommissionCalculator from '@/components/CommissionCalculator';

interface PerformanceEvaluationDetailProps {
  evaluation: any;
  onClose: () => void;
}

const PerformanceEvaluationDetail = ({ evaluation, onClose }: PerformanceEvaluationDetailProps) => {
  const { toast } = useToast();
  const { isCorporate, hiddenFeatures } = useTenantLabels();
  
  // Check if this is a sales/commission evaluation for corporate tenants
  const isSalesEval = isSalesCommissionEvaluation(evaluation?.type);
  const showCommissionCalculator = isCorporate && isSalesEval;

  const handleDownload = () => {
    // Generate evaluation report
    const reportData = {
      employee: evaluation.employee_name,
      position: evaluation.position,
      department: evaluation.department,
      period: evaluation.evaluation_period,
      overallRating: evaluation.overall_rating,
      metrics: {
        teaching_effectiveness: evaluation.teaching_effectiveness,
        classroom_management: evaluation.classroom_management,
        lesson_planning: evaluation.lesson_planning,
        student_engagement: evaluation.student_engagement,
        communication: evaluation.communication,
        teamwork: evaluation.teamwork,
        leadership: evaluation.leadership,
        professional_development: evaluation.professional_development,
        punctuality: evaluation.punctuality,
        innovation: evaluation.innovation,
      },
      feedback: {
        student_score: evaluation.student_feedback_score,
        parent_score: evaluation.parent_feedback_score,
      },
      strengths: evaluation.strengths,
      improvements: evaluation.improvement_areas,
      goals: evaluation.goals,
      evaluator: evaluation.evaluator,
      date: evaluation.created_at
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evaluation.employee_name.replace(/\s+/g, '_')}_Performance_Evaluation_${evaluation.evaluation_period.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Evaluation Downloaded",
      description: "Performance evaluation has been downloaded successfully.",
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Performance evaluation ready for printing.",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rating >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (rating >= 2.5) return <Badge className="bg-orange-100 text-orange-800">Satisfactory</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const performanceMetrics = [
    { key: 'teaching_effectiveness', label: 'Teaching Effectiveness', icon: Star },
    { key: 'classroom_management', label: 'Classroom Management', icon: Users },
    { key: 'lesson_planning', label: 'Lesson Planning', icon: Calendar },
    { key: 'student_engagement', label: 'Student Engagement', icon: TrendingUp },
    { key: 'communication', label: 'Communication', icon: Users },
    { key: 'teamwork', label: 'Teamwork & Collaboration', icon: Users },
    { key: 'leadership', label: 'Leadership', icon: Award },
    { key: 'professional_development', label: 'Professional Development', icon: Target },
    { key: 'punctuality', label: 'Punctuality & Reliability', icon: Calendar },
    { key: 'innovation', label: 'Innovation & Creativity', icon: Star }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {showCommissionCalculator ? 'Sales Commission Review' : 'Performance Evaluation Details'}
          </DialogTitle>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Employee Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{evaluation.employee_name}</h2>
                  <p className="text-gray-600">{evaluation.position} • {evaluation.department}</p>
                  <p className="text-sm text-gray-500">{evaluation.evaluation_period || evaluation.period}</p>
                </div>
                {!showCommissionCalculator && (
                  <div className="text-center">
                    {getRatingBadge(evaluation.overall_rating)}
                    <p className={`text-3xl font-bold mt-2 ${getRatingColor(evaluation.overall_rating)}`}>
                      {evaluation.overall_rating?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Overall Rating</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Show Commission Calculator for Sales evaluations in Corporate mode */}
          {showCommissionCalculator ? (
            <CommissionCalculator
              evaluationType={evaluation.type}
              employeeName={evaluation.employee_name}
              period={evaluation.evaluation_period || evaluation.period}
            />
          ) : (
            <>
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <metric.icon className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{metric.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">
                            {evaluation[metric.key]}/5
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < evaluation[metric.key] 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Scores - Hidden for corporate tenants */}
              {!hiddenFeatures.studentFeedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{evaluation.student_feedback_score?.toFixed(1) || 'N/A'}</p>
                        <p className="text-gray-600">out of 5.0</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Parent Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{evaluation.parent_feedback_score?.toFixed(1) || 'N/A'}</p>
                        <p className="text-gray-600">out of 5.0</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Detailed Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                    <p className="text-gray-700">{evaluation.strengths || 'No strengths recorded.'}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
                    <p className="text-gray-700">{evaluation.improvement_areas || 'No improvement areas recorded.'}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Goals & Development Plan</h4>
                    <p className="text-gray-700">{evaluation.goals || 'No goals recorded.'}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Evaluation Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Evaluated on {evaluation.created_at}</span>
                </div>
                <span>Evaluator: {evaluation.evaluator || evaluation.evaluator_name || 'Unknown'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceEvaluationDetail;
