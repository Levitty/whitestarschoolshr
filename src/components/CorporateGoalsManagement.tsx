import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Calendar, TrendingUp, DollarSign, Users, Search, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeSalesTargets, SalesTarget } from '@/hooks/useEmployeeSalesTargets';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CorporateGoalsManagement = () => {
  const { toast } = useToast();
  const { employees } = useEmployees();
  const { fetchSalesTarget, upsertSalesTarget, loading: savingTarget } = useEmployeeSalesTargets();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  
  // Sales target form
  const [salesTargetForm, setSalesTargetForm] = useState({
    monthlyTarget: 0,
    commissionRate: 5,
    currentMtdSales: 0
  });

  // General goals
  const [generalGoals, setGeneralGoals] = useState<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'not_started' | 'in_progress' | 'completed';
  }[]>([]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'not_started' as 'not_started' | 'in_progress' | 'completed'
  });

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  // Filter employees by search
  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load sales target when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeSalesTarget();
    }
  }, [selectedEmployeeId]);

  const loadEmployeeSalesTarget = async () => {
    const target = await fetchSalesTarget(selectedEmployeeId);
    if (target) {
      setSalesTargetForm({
        monthlyTarget: target.monthly_target,
        commissionRate: target.commission_rate * 100,
        currentMtdSales: target.current_mtd_sales || 0
      });
    } else {
      setSalesTargetForm({
        monthlyTarget: 0,
        commissionRate: 5,
        currentMtdSales: 0
      });
    }
  };

  const handleSaveSalesTarget = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Error",
        description: "Please select an employee first.",
        variant: "destructive"
      });
      return;
    }

    await upsertSalesTarget(
      selectedEmployeeId,
      salesTargetForm.monthlyTarget,
      salesTargetForm.commissionRate / 100,
      salesTargetForm.currentMtdSales
    );
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in the goal title and target date.",
        variant: "destructive"
      });
      return;
    }

    const goal = {
      id: Date.now().toString(),
      ...newGoal
    };

    setGeneralGoals([...generalGoals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetDate: '',
      priority: 'medium',
      status: 'not_started'
    });
    setShowGoalDialog(false);

    toast({
      title: "Goal Added",
      description: "New goal has been added successfully."
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => setSelectedEmployeeId(employee.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEmployeeId === employee.id 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(employee.first_name, employee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals Management - Only show when employee is selected */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Goals for {selectedEmployee.first_name} {selectedEmployee.last_name}
              </CardTitle>
              <Button onClick={() => setShowGoalDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sales" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Sales Targets
                </TabsTrigger>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Performance Goals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyTarget">Monthly Sales Target (KES)</Label>
                    <Input
                      id="monthlyTarget"
                      type="number"
                      value={salesTargetForm.monthlyTarget}
                      onChange={(e) => setSalesTargetForm(prev => ({ 
                        ...prev, 
                        monthlyTarget: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 1500000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={salesTargetForm.commissionRate}
                      onChange={(e) => setSalesTargetForm(prev => ({ 
                        ...prev, 
                        commissionRate: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentMtdSales">Current MTD Sales (KES)</Label>
                    <Input
                      id="currentMtdSales"
                      type="number"
                      value={salesTargetForm.currentMtdSales}
                      onChange={(e) => setSalesTargetForm(prev => ({ 
                        ...prev, 
                        currentMtdSales: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 750000"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-muted/50 rounded-lg mt-4">
                  <h4 className="font-medium mb-3">Target Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Target</p>
                      <p className="font-semibold">{formatCurrency(salesTargetForm.monthlyTarget)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Commission Rate</p>
                      <p className="font-semibold">{salesTargetForm.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Commission</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(salesTargetForm.monthlyTarget * (salesTargetForm.commissionRate / 100))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Achievement</p>
                      <p className="font-semibold">
                        {salesTargetForm.monthlyTarget > 0 
                          ? `${((salesTargetForm.currentMtdSales / salesTargetForm.monthlyTarget) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSalesTarget} disabled={savingTarget}>
                  <Save className="h-4 w-4 mr-2" />
                  {savingTarget ? 'Saving...' : 'Save Sales Target'}
                </Button>
              </TabsContent>

              <TabsContent value="general" className="space-y-4 mt-4">
                {generalGoals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance goals set yet.</p>
                    <Button onClick={() => setShowGoalDialog(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generalGoals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge className={getPriorityColor(goal.priority)}>
                                {goal.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Performance Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalTitle">Goal Title *</Label>
              <Input
                id="goalTitle"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter goal title"
              />
            </div>
            
            <div>
              <Label htmlFor="goalDescription">Description</Label>
              <Textarea
                id="goalDescription"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the goal..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalTargetDate">Target Date *</Label>
                <Input
                  id="goalTargetDate"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="goalPriority">Priority</Label>
                <Select
                  value={newGoal.priority}
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setNewGoal(prev => ({ ...prev, priority: value }))
                  }
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

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
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
  );
};

export default CorporateGoalsManagement;
