
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Star, User, Calendar, FileText, Download } from 'lucide-react';
import { useEvaluations } from '@/hooks/useEvaluations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const EvaluationsList = () => {
  const { evaluations, loading } = useEvaluations();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const exportToPDF = (evaluation: any) => {
    // Generate PDF report
    const reportData = {
      employee: evaluation.employee_name,
      evaluator: evaluation.evaluator_name,
      period: evaluation.period,
      branch: evaluation.branch,
      overallRating: evaluation.overall_rating,
      areas: {
        academic: {
          total: evaluation.academic_total,
          criteria: {
            studentPerformance: evaluation.academic_student_performance,
            teachingStrategies: evaluation.academic_teaching_strategies,
            slowLearners: evaluation.academic_slow_learners,
            initiatives: evaluation.academic_initiatives
          },
          comments: evaluation.academic_comments
        },
        culture: {
          total: evaluation.culture_total,
          criteria: {
            missionSupport: evaluation.culture_mission_support,
            extracurricular: evaluation.culture_extracurricular,
            collaboration: evaluation.culture_collaboration,
            diversity: evaluation.culture_diversity
          },
          comments: evaluation.culture_comments
        },
        development: {
          total: evaluation.development_total,
          criteria: {
            workshops: evaluation.development_workshops,
            education: evaluation.development_education,
            methodologies: evaluation.development_methodologies,
            mentoring: evaluation.development_mentoring
          },
          comments: evaluation.development_comments
        },
        customer: {
          total: evaluation.customer_total,
          criteria: {
            responsiveness: evaluation.customer_responsiveness,
            communication: evaluation.customer_communication,
            feedback: evaluation.customer_feedback,
            conflictResolution: evaluation.customer_conflict_resolution
          },
          comments: evaluation.customer_comments
        }
      }
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evaluation.employee_name.replace(/\s+/g, '_')}_Evaluation_${evaluation.period.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Evaluation report has been downloaded successfully.",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading evaluations...</div>;
  }

  return (
    <div className="space-y-4">
      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Evaluations Found</h3>
            <p className="text-gray-500">Start by creating teacher evaluations to track performance.</p>
          </CardContent>
        </Card>
      ) : (
        evaluations.map((evaluation) => (
          <Card key={evaluation.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-lg">{evaluation.employee_name}</CardTitle>
                    <p className="text-sm text-gray-600">{evaluation.period} • {evaluation.branch}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(evaluation.status)}>
                    {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                  </Badge>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getRatingColor(evaluation.overall_rating)}`}>
                      {evaluation.overall_rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Overall</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Area Totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{evaluation.academic_total.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Academic</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{evaluation.culture_total.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Culture</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{evaluation.development_total.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Development</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{evaluation.customer_total.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Customer</div>
                </div>
              </div>

              {/* Expandable Comments */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={() => toggleCard(evaluation.id)}
                  >
                    <span>View Detailed Comments</span>
                    {expandedCards.has(evaluation.id) ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  {evaluation.academic_comments && (
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Academic Achievement</h5>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{evaluation.academic_comments}</p>
                    </div>
                  )}
                  {evaluation.culture_comments && (
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">School Culture</h5>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">{evaluation.culture_comments}</p>
                    </div>
                  )}
                  {evaluation.development_comments && (
                    <div>
                      <h5 className="font-medium text-purple-700 mb-2">Professional Development</h5>
                      <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">{evaluation.development_comments}</p>
                    </div>
                  )}
                  {evaluation.customer_comments && (
                    <div>
                      <h5 className="font-medium text-orange-700 mb-2">Customer Relationship</h5>
                      <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">{evaluation.customer_comments}</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Evaluated on {new Date(evaluation.created_at).toLocaleDateString()}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToPDF(evaluation)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default EvaluationsList;
