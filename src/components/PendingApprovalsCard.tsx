import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCheck, Clock, ChevronRight, PartyPopper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useClearanceApprovals } from '@/hooks/useClearanceApprovals';
import { useAuth } from '@/hooks/useAuth';

export const PendingApprovalsCard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { fetchPendingApprovalsForUser } = useClearanceApprovals();
  const { data: pendingApprovals, isLoading } = fetchPendingApprovalsForUser();

  // Only show for users in relevant departments or admins
  const relevantDepartments = ['IT', 'Finance', 'Operations', 'HR'];
  const isRelevantUser =
    profile?.role === 'admin' ||
    profile?.role === 'superadmin' ||
    (profile?.department && relevantDepartments.includes(profile.department));

  if (!isRelevantUser) return null;

  const handleItemClick = (employeeId: string) => {
    navigate(`/employees/${employeeId}?tab=clearance`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Pending Your Approval
          </div>
          {pendingApprovals && pendingApprovals.length > 0 && (
            <Badge variant="destructive">{pendingApprovals.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        ) : pendingApprovals && pendingApprovals.length > 0 ? (
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              {pendingApprovals.map((approval: any) => {
                const employee = approval.clearance?.employee;
                const daysPending = formatDistanceToNow(new Date(approval.created_at), {
                  addSuffix: false,
                });

                return (
                  <Button
                    key={approval.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-muted"
                    onClick={() => employee?.id && handleItemClick(employee.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium">
                          {employee?.first_name} {employee?.last_name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {approval.department}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {daysPending}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <PartyPopper className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p>No pending approvals 🎉</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
