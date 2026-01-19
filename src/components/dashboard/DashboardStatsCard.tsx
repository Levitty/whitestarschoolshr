import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  accentColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'teal';
  className?: string;
}

const DashboardStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  className = "" 
}: DashboardStatsCardProps) => {
  const isPositive = trend ? trend.value >= 0 : true;
  
  return (
    <Card className={`bg-card border shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{isPositive ? '+' : ''}{trend.value}%</span>
                </div>
              )}
            </div>
            {trend && (
              <p className="text-xs text-muted-foreground">{trend.label}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
