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

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    trend: 'text-emerald-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    trend: 'text-blue-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    trend: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    trend: 'text-rose-600',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    trend: 'text-violet-600',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    trend: 'text-teal-600',
  },
};

const DashboardStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  accentColor = 'blue',
  className = "" 
}: DashboardStatsCardProps) => {
  const colors = colorClasses[accentColor];
  const isPositive = trend ? trend.value >= 0 : true;
  
  return (
    <Card className={`bg-card border-0 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
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
          <div className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
