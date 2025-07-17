
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  measurableOutcome: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed';
  developmentPlan: string;
}

interface GoalsManagementProps {
  employeeId: string;
  employeeName: string;
}

const GoalsManagement = ({ employeeId, employeeName }: GoalsManagementProps) => {
  const { toast } = useToast();
  
  // Mock goals data - in real app, this would come from the database
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete Advanced Mathematics Certification',
      description: 'Obtain certification in advanced mathematics teaching methodologies to improve student outcomes.',
      measurableOutcome: 'Pass certification exam with 85% or higher score',
      targetDate: '2025-03-31',
      priority: 'high',
      status: 'in_progress',
      developmentPlan: 'Attend weekend workshops, complete online modules, practice with mentor'
    },
    {
      id: '2',
      title: 'Implement Technology Integration',
      description: 'Integrate modern teaching technology into daily classroom activities.',
      measurableOutcome: 'Use technology tools in 80% of lessons, student engagement scores improve by 15%',
      targetDate: '2025-02-28',
      priority: 'medium',
      status: 'not_started',
      developmentPlan: 'Complete EdTech training course, experiment with 3 new tools, gather student feedback'
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    measurableOutcome: '',
    targetDate: '',
    priority: 'medium',
    status: 'not_started',
    developmentPlan: ''
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.measurableOutcome || !newGoal.targetDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title!,
      description: newGoal.description!,
      measurableOutcome: newGoal.measurableOutcome!,
      targetDate: newGoal.targetDate!,
      priority: newGoal.priority as 'high' | 'medium' | 'low',
      status: newGoal.status as 'not_started' | 'in_progress' | 'completed',
      developmentPlan: newGoal.developmentPlan || ''
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      measurableOutcome: '',
      targetDate: '',
      priority: 'medium',
      status: 'not_started',
      developmentPlan: ''
    });
    setShowAddGoal(false);

    toast({
      title: "Goal Added",
      description: "New goal has been added successfully.",
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast({
      title: "Goal Deleted",
      description: "Goal has been removed successfully.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Goals & Development Plan - {employeeName}</h3>
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter goal title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the goal in detail"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="measurable">Measurable Outcome *</Label>
                <Textarea
                  id="measurable"
                  value={newGoal.measurableOutcome || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, measurableOutcome: e.target.value }))}
                  placeholder="How will success be measured? Include specific metrics, percentages, or criteria"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetDate">Target Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newGoal.priority || 'medium'}
                    onValueChange={(value: 'high' | 'medium' | 'low') => setNewGoal(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="developmentPlan">Development Plan</Label>
                <Textarea
                  id="developmentPlan"
                  value={newGoal.developmentPlan || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, developmentPlan: e.target.value }))}
                  placeholder="Outline the steps, resources, and support needed to achieve this goal"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGoal}>
                  Add Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-lg">{goal.title}</h4>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status.replace('_', ' ').charAt(0).toUpperCase() + goal.status.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{goal.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Measurable Outcome
                  </h5>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{goal.measurableOutcome}</p>
                </div>

                {goal.developmentPlan && (
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Development Plan</h5>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">{goal.developmentPlan}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {goals.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Goals Set</h3>
              <p className="text-gray-500 mb-4">Start by adding professional development goals for this employee.</p>
              <Button onClick={() => setShowAddGoal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GoalsManagement;
