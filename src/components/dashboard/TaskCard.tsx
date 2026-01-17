import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, MoreHorizontal, Loader2, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { isClearanceTask } from '@/hooks/useTenantLabels';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface TaskCardProps {
  title?: string;
}

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
  cancelled: {
    icon: AlertCircle,
    label: 'Cancelled',
    className: 'bg-red-50 text-red-600 border-red-200',
    iconClass: 'text-red-400',
  },
};

const priorityColors = {
  low: 'text-slate-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const TaskCard = ({ title = 'Current Tasks' }: TaskCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'in_progress', 'completed'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user?.id,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleToggleComplete = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskStatus.mutate({ taskId: task.id, newStatus });
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {tasks.length > 0 
                ? `Done ${completedCount} of ${tasks.length} (${progressPercent}%)`
                : 'No tasks assigned'}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            <p className="text-xs text-muted-foreground mt-1">Tasks assigned to you will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const config = statusConfig[task.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isHighPriority = isClearanceTask(task.title);
              
              return (
                <div 
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    isHighPriority 
                      ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-800' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  onClick={() => handleToggleComplete(task)}
                >
                  <StatusIcon className={`h-5 w-5 flex-shrink-0 ${config.iconClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      {isHighPriority && (
                        <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          High Priority
                        </Badge>
                      )}
                    </div>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${config.className}`}>
                    {config.label}
                  </Badge>
                  {task.priority && task.priority !== 'medium' && (
                    <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
