import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  time?: string;
}

interface TaskCardProps {
  tasks?: Task[];
  title?: string;
}

const defaultTasks: Task[] = [
  { id: '1', title: 'Review leave requests', status: 'pending', time: '2h' },
  { id: '2', title: 'Complete performance review', status: 'in_progress', time: '4h' },
  { id: '3', title: 'Update employee records', status: 'completed', time: '1h' },
  { id: '4', title: 'Schedule team meeting', status: 'pending', time: '30m' },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: 'Done',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: 'text-emerald-500',
  },
  in_progress: {
    icon: Clock,
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'text-amber-500',
  },
  pending: {
    icon: AlertCircle,
    label: 'Pending',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    iconClass: 'text-slate-400',
  },
};

const TaskCard = ({ tasks = defaultTasks, title = 'Current Tasks' }: TaskCardProps) => {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Done {completedCount} of {tasks.length} ({progressPercent}%)
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tasks.map((task) => {
            const config = statusConfig[task.status];
            const StatusIcon = config.icon;
            
            return (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <StatusIcon className={`h-5 w-5 flex-shrink-0 ${config.iconClass}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                </div>
                <Badge variant="outline" className={`text-xs ${config.className}`}>
                  {config.label}
                </Badge>
                {task.time && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.time}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
