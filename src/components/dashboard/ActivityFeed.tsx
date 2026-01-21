import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { FileText, UserPlus, Calendar, Award, MessageSquare, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, profile } = useAuth();

  // Check if user is admin/superadmin/head - they can see all activity
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'head';

  // Fetch leave requests - filtered by user for non-admins
  const { data: leaveRequests } = useQuery({
    queryKey: ['recent-leave-requests', tenant?.id, user?.id, isAdmin],
    queryFn: async () => {
      if (!tenant?.id || !user?.id) return [];
      
      let query = supabase
        .from('leave_requests')
        .select(`
          id,
          leave_type,
          status,
          created_at,
          employee:profiles!leave_requests_employee_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Non-admin users only see their own leave requests
      if (!isAdmin) {
        query = query.eq('employee_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id && !!user?.id
  });

  // Fetch documents - filtered by user for non-admins
  const { data: documents } = useQuery({
    queryKey: ['recent-documents', tenant?.id, user?.id, isAdmin],
    queryFn: async () => {
      if (!tenant?.id || !user?.id) return [];
      
      let query = supabase
        .from('documents')
        .select(`
          id,
          title,
          created_at,
          uploader:profiles!documents_uploaded_by_fkey(first_name, last_name, avatar_url)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Non-admin users only see documents they uploaded or are recipients of
      if (!isAdmin) {
        query = query.or(`uploaded_by.eq.${user.id},recipient_id.eq.${user.id}`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id && !!user?.id
  });

  // Fetch tasks assigned to the user (relevant to all users)
  const { data: tasks } = useQuery({
    queryKey: ['recent-tasks', tenant?.id, user?.id, isAdmin],
    queryFn: async () => {
      if (!tenant?.id || !user?.id) return [];
      
      let query = supabase
        .from('tasks')
        .select('id, title, status, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      // Non-admin users only see tasks assigned to them
      if (!isAdmin) {
        query = query.eq('assigned_to', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id && !!user?.id
  });

  // Fetch tickets - filtered by user for non-admins
  const { data: tickets } = useQuery({
    queryKey: ['recent-tickets', tenant?.id, user?.id, isAdmin],
    queryFn: async () => {
      if (!tenant?.id || !user?.id) return [];
      
      let query = supabase
        .from('tickets')
        .select('id, title, status, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      // Non-admin users only see their own tickets
      if (!isAdmin) {
        query = query.eq('employee_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id && !!user?.id
  });

  // Build activities from real data
  const activities: Activity[] = [];

  leaveRequests?.forEach((req: any) => {
    const firstName = req.employee?.first_name || 'Unknown';
    const lastName = req.employee?.last_name || '';
    const statusText = req.status === 'approved' ? 'was approved' : 
                       req.status === 'rejected' ? 'was rejected' : 
                       'is pending';
    activities.push({
      id: `leave-${req.id}`,
      user: {
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase(),
        avatar: req.employee?.avatar_url
      },
      action: isAdmin ? 'submitted a leave request' : `Leave request ${statusText}`,
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
      action: isAdmin ? 'uploaded a document' : 'Document shared with you',
      target: doc.title,
      type: 'document',
      timestamp: new Date(doc.created_at)
    });
  });

  tasks?.forEach((task: any) => {
    activities.push({
      id: `task-${task.id}`,
      user: {
        name: 'Task',
        initials: 'T'
      },
      action: task.status === 'completed' ? 'Task completed' : 'Task assigned to you',
      target: task.title,
      type: 'message',
      timestamp: new Date(task.created_at)
    });
  });

  tickets?.forEach((ticket: any) => {
    activities.push({
      id: `ticket-${ticket.id}`,
      user: {
        name: 'Support',
        initials: 'S'
      },
      action: ticket.status === 'closed' ? 'Ticket closed' : 
              ticket.status === 'in_progress' ? 'Ticket in progress' : 'Ticket created',
      target: ticket.title,
      type: 'message',
      timestamp: new Date(ticket.created_at)
    });
  });

  // Sort by timestamp and take top 6
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);

  const isLoading = !leaveRequests && !documents && !tasks && !tickets;

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          {isAdmin ? 'Recent Activity' : 'My Activity'}
        </CardTitle>
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
