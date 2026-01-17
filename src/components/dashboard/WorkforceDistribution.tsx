import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DepartmentCount {
  department: string;
  count: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)', // emerald
  'hsl(38, 92%, 50%)',  // amber
  'hsl(262, 83%, 58%)', // violet
  'hsl(199, 89%, 48%)', // sky
  'hsl(346, 77%, 49%)', // rose
];

const WorkforceDistribution = () => {
  const { tenant } = useTenant();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['workforce-distribution', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('department')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');
      
      if (error) throw error;
      
      // Count employees per department
      const counts: Record<string, number> = {};
      (data || []).forEach((emp) => {
        const dept = emp.department || 'Unassigned';
        counts[dept] = (counts[dept] || 0) + 1;
      });
      
      // Convert to array and sort by count
      const result: DepartmentCount[] = Object.entries(counts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);
      
      return result;
    },
    enabled: !!tenant?.id,
  });

  const totalEmployees = departments.reduce((sum, d) => sum + d.count, 0);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Workforce Distribution
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
            <Users className="h-5 w-5 text-primary" />
            Workforce Distribution
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalEmployees} total employees
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Staff count by department
        </p>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No employee data available</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departments}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  dataKey="department" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DepartmentCount;
                      const percentage = ((data.count / totalEmployees) * 100).toFixed(1);
                      return (
                        <div className="bg-popover border rounded-lg shadow-lg p-3">
                          <p className="font-medium text-foreground">{data.department}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.count} employees ({percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                >
                  {departments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Legend */}
        {departments.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {departments.slice(0, 6).map((dept, index) => (
              <div key={dept.department} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground truncate">{dept.department}</span>
                <span className="font-medium text-foreground">{dept.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkforceDistribution;
