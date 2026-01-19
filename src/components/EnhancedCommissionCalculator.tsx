import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, Target, TrendingUp, Calculator, Award, Users, AlertTriangle, Search } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeSalesTargets, SalesTarget } from '@/hooks/useEmployeeSalesTargets';

const EnhancedCommissionCalculator = () => {
  const { employees } = useEmployees();
  const { fetchSalesTarget } = useEmployeeSalesTargets();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [salesTarget, setSalesTarget] = useState<SalesTarget | null>(null);
  const [actualSales, setActualSales] = useState<number>(0);
  const [loading, setLoading] = useState(false);

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
    } else {
      setSalesTarget(null);
      setActualSales(0);
    }
  }, [selectedEmployeeId]);

  const loadEmployeeSalesTarget = async () => {
    setLoading(true);
    try {
      const target = await fetchSalesTarget(selectedEmployeeId);
      setSalesTarget(target);
      if (target) {
        setActualSales(target.current_mtd_sales || 0);
      } else {
        setActualSales(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const target = salesTarget?.monthly_target || 0;
  const commissionRate = salesTarget?.commission_rate || 0.05;
  
  const achievementPercent = target > 0 ? Math.min(200, (actualSales / target) * 100) : 0;
  const commissionPayable = actualSales * commissionRate;
  const variance = actualSales - target;
  
  const getAchievementColor = () => {
    if (achievementPercent >= 100) return 'text-emerald-600';
    if (achievementPercent >= 75) return 'text-amber-600';
    if (achievementPercent >= 50) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getAchievementBadge = () => {
    if (achievementPercent >= 150) return { text: 'Exceptional!', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
    if (achievementPercent >= 100) return { text: 'Target Met!', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
    if (achievementPercent >= 75) return { text: 'Almost There', className: 'bg-amber-100 text-amber-700 border-amber-300' };
    if (achievementPercent >= 50) return { text: 'In Progress', className: 'bg-orange-100 text-orange-700 border-orange-300' };
    return { text: 'Needs Improvement', className: 'bg-red-100 text-red-700 border-red-300' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const badge = getAchievementBadge();

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
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto">
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
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commission Calculator - Only show when employee is selected */}
      {selectedEmployee && (
        <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Sales Commission Calculator
              </CardTitle>
              <Badge variant="outline" className={badge.className}>
                {badge.text}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedEmployee.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
              </div>
              <span>•</span>
              <span>{selectedEmployee.position}</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !salesTarget ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <h3 className="font-medium text-lg mb-2">No Sales Target Set</h3>
                <p className="text-muted-foreground">
                  Please set a sales target for this employee in the Goals tab.
                </p>
              </div>
            ) : (
              <>
                {/* Target and Actual Sales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Target */}
                  <div className="p-4 bg-white dark:bg-card rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      <Label className="text-sm font-medium text-muted-foreground">Monthly Target (from Goals)</Label>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(target)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Commission Rate: {(commissionRate * 100).toFixed(0)}%
                    </p>
                  </div>
                  
                  {/* Actual Sales Input */}
                  <div className="p-4 bg-white dark:bg-card rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <Label htmlFor="actual-sales" className="text-sm font-medium text-muted-foreground">
                        Actual Sales (KES)
                      </Label>
                    </div>
                    <Input
                      id="actual-sales"
                      type="number"
                      placeholder="Enter sales amount"
                      value={actualSales || ''}
                      onChange={(e) => setActualSales(parseFloat(e.target.value) || 0)}
                      className="text-xl font-bold border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                {/* Achievement Progress */}
                <div className="p-6 bg-white dark:bg-card rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <Label className="text-sm font-medium text-muted-foreground">Achievement</Label>
                    </div>
                    <span className={`text-3xl font-bold ${getAchievementColor()}`}>
                      {achievementPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, achievementPercent)} 
                    className="h-4 bg-emerald-100"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Commission Payable */}
                <div className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-emerald-100" />
                    <Label className="text-sm font-medium text-emerald-100">
                      Commission Payable ({(commissionRate * 100).toFixed(0)}%)
                    </Label>
                  </div>
                  <p className="text-4xl font-bold">{formatCurrency(commissionPayable)}</p>
                  {achievementPercent >= 100 && (
                    <p className="text-sm text-emerald-100 mt-2">
                      🎉 Target exceeded by {formatCurrency(variance)}
                    </p>
                  )}
                </div>
                
                {/* Summary with Variance */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-semibold text-foreground">{formatCurrency(target)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="font-semibold text-foreground">{formatCurrency(actualSales)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p className={`font-semibold ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="font-semibold text-emerald-600">{formatCurrency(commissionPayable)}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedCommissionCalculator;
