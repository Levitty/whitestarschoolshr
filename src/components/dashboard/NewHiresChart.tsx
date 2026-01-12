import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-border">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const NewHiresChart = () => {
  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Performance</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Employee hiring trends this year</p>
          </div>
          <Tabs defaultValue="area" className="w-auto">
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="area" className="text-xs px-3 h-6">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trend
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-xs px-3 h-6">
                <Users className="h-3 w-3 mr-1" />
                Compare
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
            <span className="text-sm text-muted-foreground">New Hires</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
            <span className="text-sm text-muted-foreground">Exits</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="newHires" 
                name="New Hires"
                stroke="#34d399" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHires)"
              />
              <Area 
                type="monotone" 
                dataKey="exits" 
                name="Exits"
                stroke="#fb7185" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExits)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewHiresChart;
