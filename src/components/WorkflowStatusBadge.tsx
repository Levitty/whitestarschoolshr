import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clock, AlertTriangle, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { differenceInDays, addMonths, differenceInMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStatusBadgeProps {
  employeeId: string;
  hireDate?: string | null;
  status?: string | null;
}

type WorkflowStatus = 
  | 'probation'
  | 'on_pip'
  | 'active'
  | 'offboarding'
  | 'exited';

interface StatusInfo {
  status: WorkflowStatus;
  label: string;
  detail: string;
  icon: React.ReactNode;
  badgeClass: string;
}

export const WorkflowStatusBadge = ({
  employeeId,
  hireDate,
  status,
}: WorkflowStatusBadgeProps) => {
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);

  useEffect(() => {
    const determineStatus = async () => {
      // Check if exited (terminated/resigned and no active clearance)
      if (status === 'terminated' || status === 'resigned' || status === 'inactive') {
        // Check for clearance
        const { data: clearance } = await supabase
          .from('offboarding_clearance')
          .select('id, status')
          .eq('employee_id', employeeId)
          .single();

        if (clearance) {
          if (clearance.status === 'completed') {
            setStatusInfo({
              status: 'exited',
              label: 'Exited',
              detail: 'Employee has completed offboarding',
              icon: <XCircle className="h-4 w-4" />,
              badgeClass: 'bg-gray-500 text-white',
            });
          } else {
            // Calculate completion percentage
            const { data: items } = await supabase
              .from('clearance_items')
              .select('is_completed')
              .eq('clearance_id', clearance.id);

            const { data: approvals } = await supabase
              .from('clearance_approvals')
              .select('status')
              .eq('clearance_id', clearance.id);

            const totalItems = (items?.length || 0) + (approvals?.length || 0);
            const completedItems = 
              (items?.filter(i => i.is_completed).length || 0) + 
              (approvals?.filter(a => a.status === 'approved').length || 0);
            
            const percentage = totalItems > 0 
              ? Math.round((completedItems / totalItems) * 100) 
              : 0;

            setStatusInfo({
              status: 'offboarding',
              label: `Offboarding (${percentage}%)`,
              detail: `${completedItems} of ${totalItems} items complete`,
              icon: <LogOut className="h-4 w-4" />,
              badgeClass: 'bg-red-500 text-white',
            });
          }
          return;
        }

        // No clearance, just marked as exited
        setStatusInfo({
          status: 'exited',
          label: 'Exited',
          detail: 'Employee is no longer active',
          icon: <XCircle className="h-4 w-4" />,
          badgeClass: 'bg-gray-500 text-white',
        });
        return;
      }

      // Check for active PIP
      const { data: pip } = await supabase
        .from('performance_improvement_plans')
        .select('start_date, review_date, status')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .single();

      if (pip) {
        const daysSinceStart = differenceInDays(new Date(), new Date(pip.start_date));
        setStatusInfo({
          status: 'on_pip',
          label: `On PIP (Day ${daysSinceStart})`,
          detail: `Review due: ${new Date(pip.review_date).toLocaleDateString()}`,
          icon: <AlertTriangle className="h-4 w-4" />,
          badgeClass: 'bg-orange-500 text-white',
        });
        return;
      }

      // Check probation (less than 6 months since hire)
      if (hireDate) {
        const monthsSinceHire = differenceInMonths(new Date(), new Date(hireDate));
        if (monthsSinceHire < 6) {
          const probationEnd = addMonths(new Date(hireDate), 6);
          const daysLeft = differenceInDays(probationEnd, new Date());
          
          setStatusInfo({
            status: 'probation',
            label: `Probation (${daysLeft} days left)`,
            detail: `Probation ends: ${probationEnd.toLocaleDateString()}`,
            icon: <Clock className="h-4 w-4" />,
            badgeClass: 'bg-yellow-500 text-white',
          });
          return;
        }
      }

      // Default: Active employee
      setStatusInfo({
        status: 'active',
        label: 'Active',
        detail: 'Employee is in good standing',
        icon: <CheckCircle className="h-4 w-4" />,
        badgeClass: 'bg-green-500 text-white',
      });
    };

    determineStatus();
  }, [employeeId, hireDate, status]);

  if (!statusInfo) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${statusInfo.badgeClass} text-sm font-medium px-3 py-1`}>
            <span className="flex items-center gap-1.5">
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.detail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
