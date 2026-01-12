import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  accentColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'teal' | 'indigo' | 'orange';
}

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500',
    hover: 'group-hover:bg-emerald-600',
    light: 'bg-emerald-50',
  },
  blue: {
    bg: 'bg-blue-500',
    hover: 'group-hover:bg-blue-600',
    light: 'bg-blue-50',
  },
  amber: {
    bg: 'bg-amber-500',
    hover: 'group-hover:bg-amber-600',
    light: 'bg-amber-50',
  },
  rose: {
    bg: 'bg-rose-500',
    hover: 'group-hover:bg-rose-600',
    light: 'bg-rose-50',
  },
  violet: {
    bg: 'bg-violet-500',
    hover: 'group-hover:bg-violet-600',
    light: 'bg-violet-50',
  },
  teal: {
    bg: 'bg-teal-500',
    hover: 'group-hover:bg-teal-600',
    light: 'bg-teal-50',
  },
  indigo: {
    bg: 'bg-indigo-500',
    hover: 'group-hover:bg-indigo-600',
    light: 'bg-indigo-50',
  },
  orange: {
    bg: 'bg-orange-500',
    hover: 'group-hover:bg-orange-600',
    light: 'bg-orange-50',
  },
};

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  accentColor = 'blue' 
}: QuickActionCardProps) => {
  const colors = colorClasses[accentColor];
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "group cursor-pointer border-0 shadow-sm bg-card",
        "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center transition-colors duration-300",
            colors.bg,
            colors.hover
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
