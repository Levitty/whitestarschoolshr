
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Star, Award, Plus } from 'lucide-react';
import { useEvaluations } from '@/hooks/useEvaluations';
import GoalsManagement from './GoalsManagement';

const EvaluationGoalsSuggestions = () => {
  const { evaluations } = useEvaluations();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');

  const generateGoalSuggestions = (evaluation: any) => {
    const suggestions = [];
    
    if (evaluation.academic_total < 4) {
      suggestions.push({
        area: 'Academic Achievement',
        color: 'bg-blue-100 text-blue-800',
        icon: Star,
        suggestions: [
          'Attend advanced pedagogy workshops',
          'Implement differentiated instruction techniques',
          'Develop individualized learning plans for struggling students',
          'Create interactive learning materials'
        ]
      });
    }
    
    if (evaluation.culture_total < 4) {
      suggestions.push({
        area: 'School Culture',
        color: 'bg-green-100 text-green-800',
        icon: Users,
        suggestions: [
          'Participate in school mission alignment training',
          'Lead an extracurricular activity or club',
          'Join collaborative teaching initiatives',
          'Attend diversity and inclusion workshops'
        ]
      });
    }
    
    if (evaluation.development_total < 4) {
      suggestions.push({
        area: 'Professional Development',
        color: 'bg-purple-100 text-purple-800',
        icon: TrendingUp,
        suggestions: [
          'Enroll in continuing education courses',
          'Attend at least 3 professional development workshops',
          'Experiment with new teaching methodologies',
          'Become a mentor for new teachers'
        ]
      });
    }
    
    if (evaluation.customer_total < 4) {
      suggestions.push({
        area: 'Customer Relationship',
        color: 'bg-orange-100 text-orange-800',
        icon: Award,
        suggestions: [
          'Improve parent-teacher communication strategies',
          'Implement regular feedback collection systems',
          'Attend conflict resolution training',
          'Develop better inquiry response protocols'
        ]
      });
    }
    
    return suggestions;
  };

  const improvementCandidates = evaluations.filter(eval => 
    eval.overall_rating < 4 && eval.status === 'approved'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Goal Suggestions Based on Evaluations</h3>
        <Badge variant="outline">
          {improvementCandidates.length} employees need development goals
        </Badge>
      </div>

      {improvementCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Improvement Areas Found</h3>
            <p className="text-gray-500">All evaluated employees are performing well across all areas!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {improvementCandidates.map((evaluation) => {
            const suggestions = generateGoalSuggestions(evaluation);
            
            return (
              <Card key={evaluation.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{evaluation.employee_name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Overall Rating: {evaluation.overall_rating.toFixed(1)}/5.0 • {evaluation.period}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedEmployeeId(evaluation.employee_id);
                        setSelectedEmployeeName(evaluation.employee_name);
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Set Goals
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <suggestion.icon className="h-5 w-5 text-gray-500" />
                          <Badge className={suggestion.color}>
                            {suggestion.area}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            (Score: {evaluation[`${suggestion.area.toLowerCase().replace(/\s+/g, '_')}_total`]?.toFixed(1) || 'N/A'}/5.0)
                          </span>
                        </div>
                        
                        <div className="ml-7 space-y-2">
                          <h5 className="font-medium text-gray-700">Suggested Goals:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {suggestion.suggestions.map((goal, goalIndex) => (
                              <li key={goalIndex}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goals Management Modal */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Set Development Goals</h2>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedEmployeeId(null);
                    setSelectedEmployeeName('');
                  }}
                >
                  Close
                </Button>
              </div>
              
              <GoalsManagement 
                employeeId={selectedEmployeeId} 
                employeeName={selectedEmployeeName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationGoalsSuggestions;
