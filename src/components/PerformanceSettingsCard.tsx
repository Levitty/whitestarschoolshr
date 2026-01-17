import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, DollarSign, Percent, TrendingUp, Save, Loader2 } from 'lucide-react';
import { useEmployeeSalesTargets, SalesTarget } from '@/hooks/useEmployeeSalesTargets';

interface PerformanceSettingsCardProps {
  employeeId: string;
  onUpdate?: () => void;
}

const PerformanceSettingsCard = ({ employeeId, onUpdate }: PerformanceSettingsCardProps) => {
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1500000);
  const [commissionRate, setCommissionRate] = useState<number>(5);
  const [currentMtdSales, setCurrentMtdSales] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { loading, fetchSalesTarget, upsertSalesTarget } = useEmployeeSalesTargets();

  useEffect(() => {
    const loadData = async () => {
      const target = await fetchSalesTarget(employeeId);
      if (target) {
        setMonthlyTarget(target.monthly_target);
        setCommissionRate(target.commission_rate * 100); // Convert to percentage
        setCurrentMtdSales(target.current_mtd_sales || 0);
      }
    };
    loadData();
  }, [employeeId]);

  // Calculate progress (mock: 80% of target)
  const mockCurrentSales = currentMtdSales || (monthlyTarget * 0.8);
  const progressPercent = monthlyTarget > 0 ? Math.min(100, (mockCurrentSales / monthlyTarget) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await upsertSalesTarget(
      employeeId,
      monthlyTarget,
      commissionRate / 100, // Convert to decimal
      mockCurrentSales
    );
    setIsSaving(false);
    if (!result.error) {
      setIsEditing(false);
      onUpdate?.();
    }
  };

  const getProgressColor = () => {
    if (progressPercent >= 100) return 'bg-emerald-500';
    if (progressPercent >= 75) return 'bg-amber-500';
    if (progressPercent >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Settings
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Sales Target */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-muted-foreground">Monthly Sales Target (KES)</Label>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(parseFloat(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            ) : (
              <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyTarget)}</p>
            )}
          </div>

          {/* Commission Rate */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-muted-foreground">Commission Rate (%)</Label>
            </div>
            {isEditing ? (
              <Input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            ) : (
              <p className="text-2xl font-bold text-foreground">{commissionRate}%</p>
            )}
          </div>
        </div>

        {/* Current MTD Sales Progress */}
        <div className="p-4 bg-white dark:bg-card rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <Label className="text-sm font-medium text-muted-foreground">Current MTD Sales</Label>
            </div>
            <span className="text-lg font-bold">{formatCurrency(mockCurrentSales)}</span>
          </div>
          <Progress value={progressPercent} className={`h-3 ${getProgressColor()}`} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span className="font-semibold">{progressPercent.toFixed(1)}% of target</span>
            <span>100%</span>
          </div>
        </div>

        {/* Potential Commission */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white">
          <p className="text-sm font-medium text-blue-100 mb-1">Potential Commission at Target</p>
          <p className="text-2xl font-bold">
            {formatCurrency(monthlyTarget * (commissionRate / 100))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceSettingsCard;
