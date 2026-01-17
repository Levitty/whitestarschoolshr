import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserCheck, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { isOnProbation, getProbationDaysRemaining } from '@/hooks/useTenantLabels';
import { formatDistanceToNow } from 'date-fns';

interface ProbationEmployee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  hire_date: string;
}

const ProbationTracker = () => {
  const { tenant } = useTenant();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['probation-employees', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      // Get employees hired in the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('id, first_name, last_name, position, department, hire_date')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .gte('hire_date', sixMonthsAgo.toISOString().split('T')[0])
        .order('hire_date', { ascending: true });
      
      if (error) throw error;
      return (data || []) as ProbationEmployee[];
    },
    enabled: !!tenant?.id,
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-500" />
            Probation Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-500" />
            Probation Tracker
          </CardTitle>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {employees.length} on Probation
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Employees in their 6-month probation period
        </p>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <UserCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">No employees on probation</p>
            <p className="text-xs text-muted-foreground mt-1">
              New hires will appear here during their 6-month probation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((emp) => {
              const daysRemaining = getProbationDaysRemaining(emp.hire_date);
              const totalDays = 180; // 6 months
              const daysElapsed = totalDays - daysRemaining;
              const progressPercent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
              const isNearEnd = daysRemaining <= 30;
              
              return (
                <div 
                  key={emp.id}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {emp.position} • {emp.department}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={isNearEnd 
                        ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {isNearEnd && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {daysRemaining} days left
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hired {formatDistanceToNow(new Date(emp.hire_date), { addSuffix: true })}
                      </span>
                      <span>{progressPercent}% complete</span>
                    </div>
                    <Progress 
                      value={progressPercent} 
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProbationTracker;
