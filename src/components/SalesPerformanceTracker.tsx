import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, Loader2 } from 'lucide-react';
import { useSalesPerformance, SalesPerformance } from '@/hooks/useSalesPerformance';
import { usePIP } from '@/hooks/usePIP';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SalesPerformanceTrackerProps {
  employeeId: string;
  employeeName: string;
  onPIPCreated?: () => void;
}

const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const SalesPerformanceTracker = ({ employeeId, employeeName, onPIPCreated }: SalesPerformanceTrackerProps) => {
  const [currentMonth, setCurrentMonth] = useState<SalesPerformance | null>(null);
  const [history, setHistory] = useState<SalesPerformance[]>([]);
  const [needsPIP, setNeedsPIP] = useState(false);
  const [showPIPDialog, setShowPIPDialog] = useState(false);
  const [pipFormData, setPIPFormData] = useState({
    expectedOutcome: 'Achieve 80% of monthly sales target consistently for 3 consecutive months',
    reviewDate: ''
  });
  const [isCreatingPIP, setIsCreatingPIP] = useState(false);

  const { loading, fetchCurrentMonthPerformance, fetchEmployeeSalesHistory, checkPIPRecommendation, fetchLast3MonthsSalesData } = useSalesPerformance();
  const { createPIP } = usePIP();

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    const [current, historyData, pipRecommendation] = await Promise.all([
      fetchCurrentMonthPerformance(employeeId),
      fetchEmployeeSalesHistory(employeeId),
      checkPIPRecommendation(employeeId)
    ]);
    
    setCurrentMonth(current);
    setHistory(historyData);
    setNeedsPIP(pipRecommendation);

    // Set default review date to 30 days from now
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 30);
    setPIPFormData(prev => ({
      ...prev,
      reviewDate: reviewDate.toISOString().split('T')[0]
    }));
  };

  const handleCreatePIP = async () => {
    setIsCreatingPIP(true);
    try {
      // Fetch last 3 months sales data for supporting_data
      const salesHistory = await fetchLast3MonthsSalesData(employeeId);
      
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 15);

      const { error } = await createPIP({
        employeeId,
        areaOfDeficiency: 'sales_target',
        expectedOutcome: pipFormData.expectedOutcome,
        reviewDate: pipFormData.reviewDate
      }, {
        sales_history: salesHistory
      });

      if (error) throw error;

      toast.success('PIP created successfully');
      setShowPIPDialog(false);
      setNeedsPIP(false);
      onPIPCreated?.();
    } catch (error) {
      console.error('Error creating PIP:', error);
      toast.error('Failed to create PIP');
    } finally {
      setIsCreatingPIP(false);
    }
  };

  const chartData = history.map(record => ({
    month: getMonthName(record.month),
    achievement: record.target_amount > 0 
      ? Math.round((record.actual_sales / record.target_amount) * 100) 
      : 0
  }));

  const achievement = currentMonth && currentMonth.target_amount > 0 
    ? Math.round((currentMonth.actual_sales / currentMonth.target_amount) * 100) 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">On Track</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = () => {
    if (chartData.length < 2) return null;
    const last = chartData[chartData.length - 1]?.achievement || 0;
    const prev = chartData[chartData.length - 2]?.achievement || 0;
    
    if (last > prev) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (last < prev) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (loading && !currentMonth) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!currentMonth && history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No sales performance data available for {employeeName}.</p>
          <p className="text-sm mt-2">Sales targets need to be set up for this employee.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* PIP Warning Banner */}
      {needsPIP && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Performance Alert</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Performance below 70% for 2+ consecutive months. Consider initiating a Performance Improvement Plan.</span>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => setShowPIPDialog(true)}
              className="ml-4"
            >
              Recommend for PIP
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Month Performance */}
      {currentMonth && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Month Performance
              </CardTitle>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                {getStatusBadge(currentMonth.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-xl font-bold">{formatCurrency(currentMonth.target_amount)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Actual Sales</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(currentMonth.actual_sales)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Achievement</p>
                <p className={`text-xl font-bold ${
                  achievement >= 80 ? 'text-green-600' : 
                  achievement >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {achievement}%
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress to Target</span>
                <span>{achievement}%</span>
              </div>
              <Progress 
                value={Math.min(achievement, 100)} 
                className={`h-2 ${
                  achievement >= 80 ? '[&>div]:bg-green-500' : 
                  achievement >= 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>
                Commission Rate: {(currentMonth.commission_rate * 100).toFixed(1)}% 
                ({formatCurrency(currentMonth.actual_sales * currentMonth.commission_rate)} earned)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6 Month Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">6-Month Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={[0, 120]} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Achievement']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <ReferenceLine y={80} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: '80% Target', position: 'right', fontSize: 10 }} />
                  <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: '70% Min', position: 'right', fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="achievement" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-primary" style={{ borderStyle: 'dashed' }}></div>
                <span>80% Target</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-destructive" style={{ borderStyle: 'dashed' }}></div>
                <span>70% Minimum</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PIP Creation Dialog */}
      <Dialog open={showPIPDialog} onOpenChange={setShowPIPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Create Performance Improvement Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">Employee: {employeeName}</p>
              <p className="text-muted-foreground mt-1">Area of Deficiency: Sales Target Achievement</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedOutcome">Expected Outcome</Label>
              <Textarea
                id="expectedOutcome"
                value={pipFormData.expectedOutcome}
                onChange={(e) => setPIPFormData(prev => ({ ...prev, expectedOutcome: e.target.value }))}
                placeholder="Define the expected improvement..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={pipFormData.reviewDate}
                onChange={(e) => setPIPFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPIPDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePIP} 
                disabled={isCreatingPIP || !pipFormData.expectedOutcome || !pipFormData.reviewDate}
              >
                {isCreatingPIP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create PIP'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
