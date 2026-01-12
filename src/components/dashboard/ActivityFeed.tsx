import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { FileText, UserPlus, Calendar, Award, MessageSquare } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target?: string;
  type: 'document' | 'employee' | 'leave' | 'performance' | 'message';
  timestamp: Date;
}

interface ActivityFeedProps {
  activities?: Activity[];
}

const iconMap: Record<Activity['type'], { icon: LucideIcon; color: string }> = {
  document: { icon: FileText, color: 'text-blue-500' },
  employee: { icon: UserPlus, color: 'text-emerald-500' },
  leave: { icon: Calendar, color: 'text-amber-500' },
  performance: { icon: Award, color: 'text-violet-500' },
  message: { icon: MessageSquare, color: 'text-rose-500' },
};

const defaultActivities: Activity[] = [
  {
    id: '1',
    user: { name: 'Sarah Johnson', initials: 'SJ' },
    action: 'submitted a leave request',
    target: 'Annual Leave',
    type: 'leave',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '2',
    user: { name: 'Michael Chen', initials: 'MC' },
    action: 'uploaded a document',
    target: 'Q4 Report.pdf',
    type: 'document',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '3',
    user: { name: 'Emily Davis', initials: 'ED' },
    action: 'completed evaluation for',
    target: 'James Wilson',
    type: 'performance',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: '4',
    user: { name: 'HR System', initials: 'HR' },
    action: 'added new employee',
    target: 'Alex Thompson',
    type: 'employee',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
];

const ActivityFeed = ({ activities = defaultActivities }: ActivityFeedProps) => {
  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const { icon: TypeIcon, color } = iconMap[activity.type];
            
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className="text-xs bg-muted">
                      {activity.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center`}>
                    <TypeIcon className={`h-2.5 w-2.5 ${color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{activity.user.name}</span>
                    {' '}
                    <span className="text-muted-foreground">{activity.action}</span>
                    {activity.target && (
                      <>
                        {' '}
                        <span className="font-medium text-foreground">{activity.target}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
                {index < activities.length - 1 && (
                  <div className="absolute left-[18px] top-10 bottom-0 w-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
