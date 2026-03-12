import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useRecruitmentAssessments } from '@/hooks/useRecruitmentAssessments';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface Question {
  question: string;
  options?: string[];
  correct_answer?: string;
  points: number;
  [key: string]: any; // Add index signature for Json compatibility
}

const RecruitmentAssessments = () => {
  const { assessments, loading, createAssessment, updateAssessment } = useRecruitmentAssessments();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [newAssessment, setNewAssessment] = useState({
    candidate_name: '',
    candidate_email: '',
    position: '',
    assessment_type: 'technical',
    time_limit: 60,
    questions: [] as Question[]
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });

  const [showQuestionDialog, setShowQuestionDialog] = useState(false);

  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question.",
        variant: "destructive"
      });
      return;
    }

    const question: Question = {
      question: currentQuestion.question,
      points: currentQuestion.points
    };

    if (newAssessment.assessment_type === 'technical' || newAssessment.assessment_type === 'aptitude') {
      question.options = currentQuestion.options.filter(opt => opt.trim() !== '');
      question.correct_answer = currentQuestion.correct_answer;
    }

    setNewAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });

    setShowQuestionDialog(false);
  };

  const removeQuestion = (index: number) => {
    setNewAssessment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssessment.candidate_name || !newAssessment.candidate_email || !newAssessment.position) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (newAssessment.questions.length === 0) {
      toast({
        title: "Questions Required",
        description: "Please add at least one question.",
        variant: "destructive"
      });
      return;
    }

    const maxScore = newAssessment.questions.reduce((total, q) => total + q.points, 0);

    const result = await createAssessment({
      candidate_name: newAssessment.candidate_name,
      candidate_email: newAssessment.candidate_email,
      position: newAssessment.position,
      assessment_type: newAssessment.assessment_type,
      time_limit: newAssessment.time_limit,
      questions: newAssessment.questions as any, // Cast to any for Json compatibility
      max_score: maxScore
    });

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to create assessment.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Assessment created successfully!",
      });
      setNewAssessment({
        candidate_name: '',
        candidate_email: '',
        position: '',
        assessment_type: 'technical',
        time_limit: 60,
        questions: []
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      evaluated: 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recruitment Assessments
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Assessment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAssessment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidate-name">Candidate Name</Label>
                      <Input
                        id="candidate-name"
                        value={newAssessment.candidate_name}
                        onChange={(e) => setNewAssessment(prev => ({ ...prev, candidate_name: e.target.value }))}
                        placeholder="Enter candidate name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidate-email">Candidate Email</Label>
                      <Input
                        id="candidate-email"
                        type="email"
                        value={newAssessment.candidate_email}
                        onChange={(e) => setNewAssessment(prev => ({ ...prev, candidate_email: e.target.value }))}
                        placeholder="candidate@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newAssessment.position}
                        onChange={(e) => setNewAssessment(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="e.g., Software Developer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="assessment-type">Assessment Type</Label>
                      <Select
                        value={newAssessment.assessment_type}
                        onValueChange={(value) => setNewAssessment(prev => ({ ...prev, assessment_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="aptitude">Aptitude</SelectItem>
                          <SelectItem value="combined">Combined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        value={newAssessment.time_limit}
                        onChange={(e) => setNewAssessment(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Questions ({newAssessment.questions.length})</h3>
                      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Question</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="question-text">Question</Label>
                              <Textarea
                                id="question-text"
                                value={currentQuestion.question}
                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="Enter your question here..."
                                rows={3}
                              />
                            </div>
                            
                            {(newAssessment.assessment_type === 'technical' || newAssessment.assessment_type === 'aptitude') && (
                              <>
                                <div>
                                  <Label>Answer Options</Label>
                                  {currentQuestion.options.map((option, index) => (
                                    <Input
                                      key={index}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...currentQuestion.options];
                                        newOptions[index] = e.target.value;
                                        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                                      }}
                                      placeholder={`Option ${index + 1}`}
                                      className="mt-2"
                                    />
                                  ))}
                                </div>
                                <div>
                                  <Label htmlFor="correct-answer">Correct Answer</Label>
                                  <Input
                                    id="correct-answer"
                                    value={currentQuestion.correct_answer}
                                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                                    placeholder="Enter the correct answer"
                                  />
                                </div>
                              </>
                            )}
                            
                            <div>
                              <Label htmlFor="points">Points</Label>
                              <Input
                                id="points"
                                type="number"
                                value={currentQuestion.points}
                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                                min="1"
                              />
                            </div>
                            
                            <Button type="button" onClick={addQuestion} className="w-full">
                              Add Question
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {newAssessment.questions.map((question, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{question.question.substring(0, 50)}...</p>
                            <p className="text-sm text-gray-500">{question.points} points</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Assessment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No assessments found. Create your first assessment to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{assessment.candidate_name}</h3>
                      <p className="text-sm text-gray-600">{assessment.position}</p>
                    </div>
                    {getStatusBadge(assessment.status || 'pending')}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {assessment.assessment_type}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {assessment.time_limit} min
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span> {Array.isArray(assessment.questions) ? assessment.questions.length : 0}
                    </div>
                    <div>
                      <span className="font-medium">Score:</span> {assessment.score || 0}/{assessment.max_score || 0}
                    </div>
                  </div>
                  {assessment.status === 'completed' && !assessment.score && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        // TODO: Implement evaluation functionality
                        toast({
                          title: "Feature Coming Soon",
                          description: "Assessment evaluation will be available soon.",
                        });
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Evaluate
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitmentAssessments;
