
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, Star, Calendar, Target } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const Performance = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [newEvaluation, setNewEvaluation] = useState({
    employee_id: '',
    evaluation_period: '',
    overall_rating: 5,
    goals_achievement: 5,
    communication: 5,
    teamwork: 5,
    leadership: 5,
    technical_skills: 5,
    comments: '',
    goals_for_next_period: ''
  });

  const isAdmin = profile?.role === 'admin';

  // Mock data for performance evaluations
  const evaluations = [
    {
      id: 1,
      employee_name: 'Sarah Johnson',
      position: 'Senior Developer',
      evaluation_period: 'Q4 2024',
      overall_rating: 4.5,
      goals_achievement: 5,
      communication: 4,
      teamwork: 5,
      leadership: 4,
      technical_skills: 5,
      created_at: '2024-12-15',
      evaluator: 'John Smith'
    },
    {
      id: 2,
      employee_name: 'Mike Chen',
      position: 'Product Manager',
      evaluation_period: 'Q4 2024',
      overall_rating: 4.2,
      goals_achievement: 4,
      communication: 5,
      teamwork: 4,
      leadership: 5,
      technical_skills: 3,
      created_at: '2024-12-10',
      evaluator: 'John Smith'
    }
  ];

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvaluation.employee_id || !newEvaluation.evaluation_period) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual creation logic
    toast({
      title: "Success",
      description: "Performance evaluation created successfully!",
    });

    setNewEvaluation({
      employee_id: '',
      evaluation_period: '',
      overall_rating: 5,
      goals_achievement: 5,
      communication: 5,
      teamwork: 5,
      leadership: 5,
      technical_skills: 5,
      comments: '',
      goals_for_next_period: ''
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rating >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Tracking</h1>
          <p className="text-slate-600 mt-1">Evaluate and track employee performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              New Evaluation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Performance Evaluation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvaluation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select
                    value={newEvaluation.employee_id}
                    onValueChange={(value) => setNewEvaluation(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Sarah Johnson</SelectItem>
                      <SelectItem value="2">Mike Chen</SelectItem>
                      <SelectItem value="3">Emily Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Evaluation Period</Label>
                  <Input
                    id="period"
                    value={newEvaluation.evaluation_period}
                    onChange={(e) => setNewEvaluation(prev => ({ ...prev, evaluation_period: e.target.value }))}
                    placeholder="e.g., Q1 2025"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance Metrics</h3>
                
                {[
                  { key: 'overall_rating', label: 'Overall Rating' },
                  { key: 'goals_achievement', label: 'Goals Achievement' },
                  { key: 'communication', label: 'Communication' },
                  { key: 'teamwork', label: 'Teamwork' },
                  { key: 'leadership', label: 'Leadership' },
                  { key: 'technical_skills', label: 'Technical Skills' }
                ].map((metric) => (
                  <div key={metric.key} className="flex items-center justify-between">
                    <Label className="flex-1">{metric.label}</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">1</span>
                      <Input
                        type="range"
                        min="1"
                        max="5"
                        value={newEvaluation[metric.key as keyof typeof newEvaluation] as number}
                        onChange={(e) => setNewEvaluation(prev => ({ 
                          ...prev, 
                          [metric.key]: parseInt(e.target.value) 
                        }))}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">5</span>
                      <span className="w-8 text-center font-medium">
                        {newEvaluation[metric.key as keyof typeof newEvaluation]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="comments">Comments & Feedback</Label>
                <Textarea
                  id="comments"
                  value={newEvaluation.comments}
                  onChange={(e) => setNewEvaluation(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Provide detailed feedback on performance..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="goals">Goals for Next Period</Label>
                <Textarea
                  id="goals"
                  value={newEvaluation.goals_for_next_period}
                  onChange={(e) => setNewEvaluation(prev => ({ ...prev, goals_for_next_period: e.target.value }))}
                  placeholder="Set goals and objectives for the next evaluation period..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Evaluation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.35</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evaluations This Quarter</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Performers</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Evaluations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{evaluation.employee_name}</h3>
                    <p className="text-sm text-gray-600">{evaluation.position} • {evaluation.evaluation_period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRatingBadge(evaluation.overall_rating)}
                    <span className={`text-lg font-bold ${getRatingColor(evaluation.overall_rating)}`}>
                      {evaluation.overall_rating}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Goals:</span> {evaluation.goals_achievement}/5
                  </div>
                  <div>
                    <span className="font-medium">Communication:</span> {evaluation.communication}/5
                  </div>
                  <div>
                    <span className="font-medium">Teamwork:</span> {evaluation.teamwork}/5
                  </div>
                  <div>
                    <span className="font-medium">Leadership:</span> {evaluation.leadership}/5
                  </div>
                  <div>
                    <span className="font-medium">Technical:</span> {evaluation.technical_skills}/5
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Evaluated on {evaluation.created_at} by {evaluation.evaluator}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
