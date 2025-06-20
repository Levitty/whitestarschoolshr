
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Plus, Star, Calendar, Target, Users, BarChart3, Award } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const Performance = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [newEvaluation, setNewEvaluation] = useState({
    employee_id: '',
    evaluation_period: '',
    evaluation_type: 'annual',
    teaching_effectiveness: 5,
    classroom_management: 5,
    lesson_planning: 5,
    student_engagement: 5,
    communication: 5,
    teamwork: 5,
    leadership: 5,
    professional_development: 5,
    punctuality: 5,
    innovation: 5,
    comments: '',
    goals_for_next_period: '',
    student_feedback_score: 4.5,
    parent_feedback_score: 4.2
  });

  const isAdmin = profile?.role === 'admin';

  // Mock data for performance evaluations with school-specific metrics
  const evaluations = [
    {
      id: 1,
      employee_name: 'Sarah Johnson',
      position: 'Mathematics Teacher',
      department: 'Mathematics',
      evaluation_period: 'Annual 2024',
      evaluation_type: 'annual',
      overall_rating: 4.6,
      teaching_effectiveness: 5,
      classroom_management: 4,
      lesson_planning: 5,
      student_engagement: 4,
      communication: 5,
      teamwork: 4,
      leadership: 4,
      professional_development: 5,
      punctuality: 5,
      innovation: 4,
      student_feedback_score: 4.7,
      parent_feedback_score: 4.5,
      created_at: '2024-12-15',
      evaluator: 'Principal Smith',
      strengths: 'Excellent mathematical knowledge, innovative teaching methods',
      improvement_areas: 'Could improve classroom discipline strategies',
      goals: 'Complete advanced mathematics certification, implement new teaching technology'
    },
    {
      id: 2,
      employee_name: 'Mike Chen',
      position: 'Science Teacher',
      department: 'Science',
      evaluation_period: 'Mid-Year 2024',
      evaluation_type: 'mid-year',
      overall_rating: 4.2,
      teaching_effectiveness: 4,
      classroom_management: 4,
      lesson_planning: 4,
      student_engagement: 5,
      communication: 4,
      teamwork: 5,
      leadership: 3,
      professional_development: 4,
      punctuality: 5,
      innovation: 5,
      student_feedback_score: 4.4,
      parent_feedback_score: 4.1,
      created_at: '2024-12-10',
      evaluator: 'Department Head Wilson',
      strengths: 'Great lab safety practices, engaging experiments',
      improvement_areas: 'Leadership skills, mentoring new teachers',
      goals: 'Take on department leadership role, publish research paper'
    }
  ];

  // Mock employee data
  const employees = [
    { id: '1', name: 'Sarah Johnson', position: 'Mathematics Teacher', department: 'Mathematics' },
    { id: '2', name: 'Mike Chen', position: 'Science Teacher', department: 'Science' },
    { id: '3', name: 'Emily Davis', position: 'English Teacher', department: 'English' },
    { id: '4', name: 'John Wilson', position: 'Department Head', department: 'Science' }
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

    // Reset form
    setNewEvaluation({
      employee_id: '',
      evaluation_period: '',
      evaluation_type: 'annual',
      teaching_effectiveness: 5,
      classroom_management: 5,
      lesson_planning: 5,
      student_engagement: 5,
      communication: 5,
      teamwork: 5,
      leadership: 5,
      professional_development: 5,
      punctuality: 5,
      innovation: 5,
      comments: '',
      goals_for_next_period: '',
      student_feedback_score: 4.5,
      parent_feedback_score: 4.2
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
          <h1 className="text-3xl font-bold text-slate-900">Performance Management</h1>
          <p className="text-slate-600 mt-1">Comprehensive performance tracking and evaluation system</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evaluations This Year</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
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
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Evaluations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals & Development</TabsTrigger>
          <TabsTrigger value="feedback">Student & Parent Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Performance Evaluations</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Evaluation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Performance Evaluation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvaluation} className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
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
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="period">Evaluation Period</Label>
                      <Input
                        id="period"
                        value={newEvaluation.evaluation_period}
                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, evaluation_period: e.target.value }))}
                        placeholder="e.g., Annual 2024"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Evaluation Type</Label>
                      <Select
                        value={newEvaluation.evaluation_type}
                        onValueChange={(value) => setNewEvaluation(prev => ({ ...prev, evaluation_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">Annual Review</SelectItem>
                          <SelectItem value="mid-year">Mid-Year Review</SelectItem>
                          <SelectItem value="probationary">Probationary Review</SelectItem>
                          <SelectItem value="special">Special Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Teaching & Professional Metrics</h3>
                    
                    {performanceMetrics.map((metric) => (
                      <div key={metric.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <metric.icon className="h-5 w-5 text-gray-500" />
                          <Label className="flex-1 font-medium">{metric.label}</Label>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 w-8">1</span>
                          <Input
                            type="range"
                            min="1"
                            max="5"
                            step="0.1"
                            value={newEvaluation[metric.key as keyof typeof newEvaluation] as number}
                            onChange={(e) => setNewEvaluation(prev => ({ 
                              ...prev, 
                              [metric.key]: parseFloat(e.target.value) 
                            }))}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-500 w-8">5</span>
                          <span className="w-12 text-center font-medium text-blue-600">
                            {(newEvaluation[metric.key as keyof typeof newEvaluation] as number).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_feedback">Student Feedback Score</Label>
                      <Input
                        id="student_feedback"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newEvaluation.student_feedback_score}
                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, student_feedback_score: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="parent_feedback">Parent Feedback Score</Label>
                      <Input
                        id="parent_feedback"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newEvaluation.parent_feedback_score}
                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, parent_feedback_score: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comments">Detailed Comments & Feedback</Label>
                    <Textarea
                      id="comments"
                      value={newEvaluation.comments}
                      onChange={(e) => setNewEvaluation(prev => ({ ...prev, comments: e.target.value }))}
                      placeholder="Provide detailed feedback on performance, strengths, and areas for improvement..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goals">Goals & Development Plan</Label>
                    <Textarea
                      id="goals"
                      value={newEvaluation.goals_for_next_period}
                      onChange={(e) => setNewEvaluation(prev => ({ ...prev, goals_for_next_period: e.target.value }))}
                      placeholder="Set specific goals and professional development objectives for the next evaluation period..."
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

          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{evaluation.employee_name}</h3>
                    <p className="text-gray-600">{evaluation.position} • {evaluation.department} • {evaluation.evaluation_period}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRatingBadge(evaluation.overall_rating)}
                    <span className={`text-2xl font-bold ${getRatingColor(evaluation.overall_rating)}`}>
                      {evaluation.overall_rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Teaching</p>
                    <p className="text-lg font-bold text-blue-600">{evaluation.teaching_effectiveness}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Management</p>
                    <p className="text-lg font-bold text-green-600">{evaluation.classroom_management}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Planning</p>
                    <p className="text-lg font-bold text-purple-600">{evaluation.lesson_planning}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Student Feedback</p>
                    <p className="text-lg font-bold text-orange-600">{evaluation.student_feedback_score.toFixed(1)}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Parent Feedback</p>
                    <p className="text-lg font-bold text-pink-600">{evaluation.parent_feedback_score.toFixed(1)}/5</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="font-medium text-green-700">Strengths:</h4>
                    <p className="text-sm text-gray-600">{evaluation.strengths}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700">Areas for Improvement:</h4>
                    <p className="text-sm text-gray-600">{evaluation.improvement_areas}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700">Goals:</h4>
                    <p className="text-sm text-gray-600">{evaluation.goals}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Evaluated on {evaluation.created_at} by {evaluation.evaluator}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">Performance Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Mathematics Department</span>
                    <span className="font-semibold">4.6/5</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Science Department</span>
                    <span className="font-semibold">4.3/5</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>English Department</span>
                    <span className="font-semibold">4.4/5</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Administration</span>
                    <span className="font-semibold">4.1/5</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Teaching Effectiveness</span>
                  <span className="font-semibold">4.5/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Engagement</span>
                  <span className="font-semibold">4.3/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Classroom Management</span>
                  <span className="font-semibold">4.2/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Development</span>
                  <span className="font-semibold">4.4/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Innovation & Creativity</span>
                  <span className="font-semibold">4.1/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <h2 className="text-xl font-semibold">Professional Development Goals</h2>
          
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Sarah Johnson - Mathematics Teacher</h3>
                    <p className="text-gray-600 text-sm">Goals for 2025</p>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Complete Advanced Mathematics Certification - Due: March 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Implement new teaching technology in classroom - Due: February 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Mentor 2 new mathematics teachers - Due: June 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Mike Chen - Science Teacher</h3>
                    <p className="text-gray-600 text-sm">Goals for 2025</p>
                  </div>
                  <Badge variant="secondary">Planning</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Take on department leadership role - Due: April 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Publish research paper on innovative lab techniques - Due: August 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <h2 className="text-xl font-semibold">Student & Parent Feedback</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Student Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm italic">"Ms. Johnson explains math concepts very clearly and makes them interesting!"</p>
                  <p className="text-xs text-gray-600 mt-1">Grade 10 Student - Mathematics</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm italic">"Mr. Chen's science experiments are amazing. I look forward to his class every day."</p>
                  <p className="text-xs text-gray-600 mt-1">Grade 9 Student - Science</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm italic">"The teacher is always punctual and well-prepared for lessons."</p>
                  <p className="text-xs text-gray-600 mt-1">Grade 11 Student - Mathematics</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parent Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Communication with Parents</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">4.3/5</span>
                    <div className="flex">
                      {[1,2,3,4].map(i => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Student Progress Updates</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">4.5/5</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Responsiveness to Concerns</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">4.1/5</span>
                    <div className="flex">
                      {[1,2,3,4].map(i => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
