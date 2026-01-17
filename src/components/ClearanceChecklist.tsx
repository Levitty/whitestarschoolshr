import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, 
  Monitor, 
  DollarSign, 
  Package,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useClearance, Clearance, ClearanceItem } from '@/hooks/useClearance';

interface ClearanceChecklistProps {
  employeeId: string;
  employeeName: string;
  employeeStatus: string;
  onUpdate?: () => void;
}

const DEPARTMENT_ICONS = {
  IT: Monitor,
  Finance: DollarSign,
  Operations: Package,
};

const DEPARTMENT_COLORS = {
  IT: 'text-blue-600 bg-blue-50 border-blue-200',
  Finance: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Operations: 'text-purple-600 bg-purple-50 border-purple-200',
};

const ClearanceChecklist = ({ 
  employeeId, 
  employeeName, 
  employeeStatus,
  onUpdate 
}: ClearanceChecklistProps) => {
  const [clearance, setClearance] = useState<Clearance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { loading, fetchClearance, initiateClearance, updateClearanceItem, completeClearance } = useClearance();

  const shouldShowClearance = ['terminated', 'resigned', 'inactive'].includes(employeeStatus?.toLowerCase() || '');

  useEffect(() => {
    if (shouldShowClearance) {
      loadClearance();
    } else {
      setIsLoading(false);
    }
  }, [employeeId, employeeStatus]);

  const loadClearance = async () => {
    setIsLoading(true);
    let data = await fetchClearance(employeeId);
    
    // Auto-initiate clearance for resigned/terminated employees
    if (!data && shouldShowClearance) {
      data = await initiateClearance(employeeId);
    }
    
    setClearance(data);
    setIsLoading(false);
  };

  const handleItemToggle = async (itemId: string, currentValue: boolean) => {
    const result = await updateClearanceItem(itemId, !currentValue);
    if (!result.error) {
      // Optimistic update
      setClearance(prev => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, is_completed: !currentValue } : item
          )
        };
      });
      onUpdate?.();
    }
  };

  const handleCompleteClearance = async () => {
    if (!clearance) return;
    await completeClearance(clearance.id);
    loadClearance();
    onUpdate?.();
  };

  if (!shouldShowClearance) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!clearance || !clearance.items) {
    return null;
  }

  const completedItems = clearance.items.filter(item => item.is_completed).length;
  const totalItems = clearance.items.length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isComplete = progressPercent === 100;

  // Group items by department
  const groupedItems = clearance.items.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = [];
    }
    acc[item.department].push(item);
    return acc;
  }, {} as Record<string, ClearanceItem[]>);

  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Departmental Clearance
          </CardTitle>
          <Badge 
            className={
              isComplete 
                ? "bg-emerald-500 text-white" 
                : "bg-orange-500 text-white"
            }
          >
            {clearance.status === 'completed' ? 'Completed' : `${progressPercent.toFixed(0)}% Complete`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Offboarding clearance for {employeeName} ({employeeStatus})
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Clearance Progress</span>
            <span className="font-semibold">{completedItems} / {totalItems} items</span>
          </div>
          <Progress 
            value={progressPercent} 
            className={`h-3 ${isComplete ? 'bg-emerald-100' : 'bg-orange-100'}`}
          />
        </div>

        {/* Department Sections */}
        {Object.entries(groupedItems).map(([department, items]) => {
          const DeptIcon = DEPARTMENT_ICONS[department as keyof typeof DEPARTMENT_ICONS] || Package;
          const deptColors = DEPARTMENT_COLORS[department as keyof typeof DEPARTMENT_COLORS] || '';
          const deptComplete = items.every(item => item.is_completed);

          return (
            <div 
              key={department}
              className={`p-4 rounded-xl border-2 ${deptColors}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <DeptIcon className="h-5 w-5" />
                <h4 className="font-semibold">{department} Department</h4>
                {deptComplete && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                )}
              </div>
              
              <div className="space-y-3">
                {items.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-card/50"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.is_completed}
                      onCheckedChange={() => handleItemToggle(item.id, item.is_completed)}
                      disabled={clearance.status === 'completed'}
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-sm font-medium cursor-pointer ${
                        item.is_completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.item_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Complete Clearance Button */}
        {isComplete && clearance.status !== 'completed' && (
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCompleteClearance}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Clearance as Complete
          </Button>
        )}

        {clearance.status === 'completed' && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              Clearance Completed
            </p>
            <p className="text-xs text-muted-foreground">
              Completed on {clearance.completed_at ? new Date(clearance.completed_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClearanceChecklist;
