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

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
}: QuickActionCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "group cursor-pointer border shadow-sm bg-card",
        "hover:shadow-md hover:border-primary/30 transition-all duration-200"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
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
