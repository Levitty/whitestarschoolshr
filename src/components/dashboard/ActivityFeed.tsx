import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { FileText, UserPlus, Calendar, Award, MessageSquare, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

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

const iconMap: Record<Activity['type'], { icon: LucideIcon; color: string }> = {
  document: { icon: FileText, color: 'text-blue-500' },
  employee: { icon: UserPlus, color: 'text-emerald-500' },
  leave: { icon: Calendar, color: 'text-amber-500' },
  performance: { icon: Award, color: 'text-violet-500' },
  message: { icon: MessageSquare, color: 'text-rose-500' },
};

const ActivityFeed = () => {
  const { tenant } = useTenant();

  // Fetch real leave requests filtered by tenant
  const { data: leaveRequests } = useQuery({
    queryKey: ['recent-leave-requests', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          id,
          leave_type,
          created_at,
          employee:profiles!leave_requests_employee_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch real document uploads filtered by tenant
  const { data: documents } = useQuery({
    queryKey: ['recent-documents', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          created_at,
          uploader:profiles!documents_uploaded_by_fkey(first_name, last_name, avatar_url)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch recent evaluations filtered by tenant
  const { data: evaluations } = useQuery({
    queryKey: ['recent-evaluations', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          id,
          period,
          created_at,
          employee:employee_profiles!evaluations_employee_id_fkey(first_name, last_name)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch recent employee additions filtered by tenant
  const { data: employees } = useQuery({
    queryKey: ['recent-employees', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('id, first_name, last_name, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Build activities from real data
  const activities: Activity[] = [];

  leaveRequests?.forEach((req: any) => {
    const firstName = req.employee?.first_name || 'Unknown';
    const lastName = req.employee?.last_name || '';
    activities.push({
      id: `leave-${req.id}`,
      user: {
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase(),
        avatar: req.employee?.avatar_url
      },
      action: 'submitted a leave request',
      target: req.leave_type,
      type: 'leave',
      timestamp: new Date(req.created_at)
    });
  });

  documents?.forEach((doc: any) => {
    const firstName = doc.uploader?.first_name || 'System';
    const lastName = doc.uploader?.last_name || '';
    activities.push({
      id: `doc-${doc.id}`,
      user: {
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName[0] || 'S'}${lastName[0] || ''}`.toUpperCase(),
        avatar: doc.uploader?.avatar_url
      },
      action: 'uploaded a document',
      target: doc.title,
      type: 'document',
      timestamp: new Date(doc.created_at)
    });
  });

  evaluations?.forEach((ev: any) => {
    const firstName = ev.employee?.first_name || 'Unknown';
    const lastName = ev.employee?.last_name || '';
    activities.push({
      id: `eval-${ev.id}`,
      user: {
        name: 'HR System',
        initials: 'HR'
      },
      action: 'completed evaluation for',
      target: `${firstName} ${lastName}`.trim(),
      type: 'performance',
      timestamp: new Date(ev.created_at)
    });
  });

  employees?.forEach((emp: any) => {
    activities.push({
      id: `emp-${emp.id}`,
      user: {
        name: 'HR System',
        initials: 'HR'
      },
      action: 'added new employee',
      target: `${emp.first_name} ${emp.last_name}`.trim(),
      type: 'employee',
      timestamp: new Date(emp.created_at)
    });
  });

  // Sort by timestamp and take top 6
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);

  const isLoading = !leaveRequests && !documents && !evaluations && !employees;

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sortedActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity) => {
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
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center">
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
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
