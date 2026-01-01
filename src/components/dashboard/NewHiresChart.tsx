import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

// Sample data - this would come from actual employee data in production
const chartData = [
  { month: 'Jan', newHires: 12, exits: 5 },
  { month: 'Feb', newHires: 18, exits: 8 },
  { month: 'Mar', newHires: 25, exits: 12 },
  { month: 'Apr', newHires: 35, exits: 12 },
  { month: 'May', newHires: 28, exits: 15 },
  { month: 'Jun', newHires: 22, exits: 10 },
  { month: 'Jul', newHires: 30, exits: 8 },
  { month: 'Aug', newHires: 35, exits: 14 },
  { month: 'Sep', newHires: 28, exits: 9 },
  { month: 'Oct', newHires: 32, exits: 11 },
  { month: 'Nov', newHires: 25, exits: 7 },
  { month: 'Dec', newHires: 20, exits: 6 },
];

const NewHiresChart = () => {
  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold text-foreground">New Hires vs. Exits</CardTitle>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-muted-foreground">New Hires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-muted-foreground">Exits</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              <Bar 
                dataKey="newHires" 
                name="New Hires"
                fill="#34d399" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                dataKey="exits" 
                name="Exits"
                fill="#fb7185" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewHiresChart;
