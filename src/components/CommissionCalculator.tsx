import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, TrendingUp, Calculator, Award } from 'lucide-react';

interface CommissionCalculatorProps {
  evaluationType: string;
  employeeName?: string;
  period?: string;
  defaultTarget?: number;
  defaultCommissionRate?: number;
  onSalesUpdate?: (sales: number) => void;
}

const CommissionCalculator = ({
  evaluationType,
  employeeName = 'Employee',
  period = 'This Month',
  defaultTarget = 1500000,
  defaultCommissionRate = 0.05,
  onSalesUpdate,
}: CommissionCalculatorProps) => {
  const [actualSales, setActualSales] = useState<number>(0);
  
  const target = defaultTarget;
  const commissionRate = defaultCommissionRate;
  
  const achievementPercent = target > 0 ? Math.min(200, (actualSales / target) * 100) : 0;
  const commissionPayable = actualSales * commissionRate;
  
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

  const handleSalesChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setActualSales(numValue);
    onSalesUpdate?.(numValue);
  };

  const badge = getAchievementBadge();

  return (
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
          <span>{employeeName}</span>
          <span>•</span>
          <span>{period}</span>
          <span>•</span>
          <span>{evaluationType}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Target and Actual Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Target */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-emerald-600" />
              <Label className="text-sm font-medium text-muted-foreground">Monthly Target</Label>
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
              onChange={(e) => handleSalesChange(e.target.value)}
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
            <Label className="text-sm font-medium text-emerald-100">Commission Payable ({(commissionRate * 100).toFixed(0)}%)</Label>
          </div>
          <p className="text-4xl font-bold">{formatCurrency(commissionPayable)}</p>
          {achievementPercent >= 100 && (
            <p className="text-sm text-emerald-100 mt-2">
              Target exceeded by {formatCurrency(actualSales - target)}
            </p>
          )}
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
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
            <p className={`font-semibold ${actualSales >= target ? 'text-emerald-600' : 'text-red-600'}`}>
              {actualSales >= target ? '+' : ''}{formatCurrency(actualSales - target)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionCalculator;
