import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  ClipboardCheck,
  TrendingDown,
} from 'lucide-react';
import { addDays, differenceInDays, addMonths, isWithinInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface ActionItem {
  id: string;
  employeeId: string;
  employeeName: string;
  action: string;
  urgency: 'high' | 'medium' | 'low';
  daysInfo?: string;
}

interface ActionSection {
  title: string;
  icon: React.ReactNode;
  items: ActionItem[];
}

export const HRActionsRequired = () => {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [expandedSections, setExpandedSections] = useState<string[]>(['probation']);

  const { data: actions, isLoading } = useQuery({
    queryKey: ['hr-actions-required', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return { sections: [], totalCount: 0 };

      const sections: ActionSection[] = [];
      let totalCount = 0;

      // 1. Probation Reviews Due - employees completing 6 months within next 7 days
      const { data: employees } = await supabase
        .from('employee_profiles')
        .select('id, first_name, last_name, hire_date, status')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      const probationItems: ActionItem[] = [];
      const now = new Date();
      const sevenDaysFromNow = addDays(now, 7);

      employees?.forEach((emp) => {
        if (emp.hire_date) {
          const sixMonthsFromHire = addMonths(new Date(emp.hire_date), 6);
          if (isWithinInterval(sixMonthsFromHire, { start: now, end: sevenDaysFromNow })) {
            const daysUntil = differenceInDays(sixMonthsFromHire, now);
            probationItems.push({
              id: `prob-${emp.id}`,
              employeeId: emp.id,
              employeeName: `${emp.first_name} ${emp.last_name}`,
              action: 'Probation review due',
              urgency: daysUntil <= 2 ? 'high' : daysUntil <= 5 ? 'medium' : 'low',
              daysInfo: daysUntil === 0 ? 'Today' : `In ${daysUntil} days`,
            });
          }
        }
      });

      if (probationItems.length > 0) {
        sections.push({
          title: 'Probation Reviews Due',
          icon: <UserCheck className="h-4 w-4" />,
          items: probationItems,
        });
        totalCount += probationItems.length;
      }

      // 2. PIP Check-ins (Day 14-16)
      const { data: pips } = await supabase
        .from('performance_improvement_plans')
        .select(`
          id,
          start_date,
          check_in_date,
          review_date,
          status,
          employee:employee_profiles(id, first_name, last_name)
        `)
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      const pipCheckInItems: ActionItem[] = [];
      const pipReviewItems: ActionItem[] = [];

      pips?.forEach((pip: any) => {
        const daysSinceStart = differenceInDays(now, new Date(pip.start_date));
        const daysUntilCheckIn = differenceInDays(new Date(pip.check_in_date), now);
        const daysUntilReview = differenceInDays(new Date(pip.review_date), now);

        // Check-in window (around day 14)
        if (daysUntilCheckIn >= -2 && daysUntilCheckIn <= 2) {
          pipCheckInItems.push({
            id: `pip-check-${pip.id}`,
            employeeId: pip.employee?.id,
            employeeName: `${pip.employee?.first_name} ${pip.employee?.last_name}`,
            action: 'PIP check-in due',
            urgency: daysUntilCheckIn <= 0 ? 'high' : 'medium',
            daysInfo: daysUntilCheckIn === 0 ? 'Today' : daysUntilCheckIn < 0 ? 'Overdue' : `In ${daysUntilCheckIn} days`,
          });
        }

        // Review window (around day 30)
        if (daysUntilReview >= -2 && daysUntilReview <= 2) {
          pipReviewItems.push({
            id: `pip-review-${pip.id}`,
            employeeId: pip.employee?.id,
            employeeName: `${pip.employee?.first_name} ${pip.employee?.last_name}`,
            action: 'PIP final review due',
            urgency: 'high',
            daysInfo: daysUntilReview === 0 ? 'Today' : daysUntilReview < 0 ? 'Overdue' : `In ${daysUntilReview} days`,
          });
        }
      });

      if (pipCheckInItems.length > 0) {
        sections.push({
          title: 'PIP Check-ins',
          icon: <AlertTriangle className="h-4 w-4" />,
          items: pipCheckInItems,
        });
        totalCount += pipCheckInItems.length;
      }

      if (pipReviewItems.length > 0) {
        sections.push({
          title: 'PIP Final Reviews',
          icon: <AlertTriangle className="h-4 w-4" />,
          items: pipReviewItems,
        });
        totalCount += pipReviewItems.length;
      }

      // 3. Pending Clearances
      const { data: clearances } = await supabase
        .from('offboarding_clearance')
        .select(`
          id,
          status,
          initiated_at,
          employee:employee_profiles(id, first_name, last_name)
        `)
        .eq('tenant_id', tenant.id)
        .neq('status', 'completed');

      const clearanceItems: ActionItem[] = [];

      for (const clearance of clearances || []) {
        const { count: totalItems } = await supabase
          .from('clearance_items')
          .select('*', { count: 'exact', head: true })
          .eq('clearance_id', clearance.id);

        const { count: completedItems } = await supabase
          .from('clearance_items')
          .select('*', { count: 'exact', head: true })
          .eq('clearance_id', clearance.id)
          .eq('is_completed', true);

        const progress = totalItems ? Math.round(((completedItems || 0) / totalItems) * 100) : 0;
        const daysSinceInitiated = differenceInDays(now, new Date(clearance.initiated_at));

        clearanceItems.push({
          id: `clear-${clearance.id}`,
          employeeId: (clearance.employee as any)?.id,
          employeeName: `${(clearance.employee as any)?.first_name} ${(clearance.employee as any)?.last_name}`,
          action: `Clearance ${progress}% complete`,
          urgency: daysSinceInitiated > 14 ? 'high' : daysSinceInitiated > 7 ? 'medium' : 'low',
          daysInfo: `${daysSinceInitiated} days pending`,
        });
      }

      if (clearanceItems.length > 0) {
        sections.push({
          title: 'Pending Clearances',
          icon: <ClipboardCheck className="h-4 w-4" />,
          items: clearanceItems,
        });
        totalCount += clearanceItems.length;
      }

      // 4. Sales Alerts (employees with critical sales status)
      const { data: salesData } = await supabase
        .from('sales_performance')
        .select(`
          id,
          status,
          employee:employee_profiles(id, first_name, last_name)
        `)
        .eq('tenant_id', tenant.id)
        .eq('status', 'critical');

      const salesItems: ActionItem[] = (salesData || []).map((sale: any) => ({
        id: `sales-${sale.id}`,
        employeeId: sale.employee?.id,
        employeeName: `${sale.employee?.first_name} ${sale.employee?.last_name}`,
        action: 'Critical sales performance',
        urgency: 'high' as const,
      }));

      if (salesItems.length > 0) {
        sections.push({
          title: 'Sales Alerts',
          icon: <TrendingDown className="h-4 w-4" />,
          items: salesItems,
        });
        totalCount += salesItems.length;
      }

      return { sections, totalCount };
    },
    enabled: !!tenant?.id,
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            HR Actions Required
          </div>
          {actions?.totalCount ? (
            <Badge variant="destructive">{actions.totalCount}</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        ) : actions?.sections && actions.sections.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {actions.sections.map((section) => (
                <Collapsible
                  key={section.title}
                  open={expandedSections.includes(section.title)}
                  onOpenChange={() => toggleSection(section.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-auto p-3 hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="font-medium">{section.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {section.items.length}
                        </Badge>
                      </div>
                      {expandedSections.includes(section.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {section.items.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 hover:bg-muted text-sm"
                        onClick={() => navigate(`/employees/${item.employeeId}`)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{item.employeeName}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.daysInfo && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {item.daysInfo}
                              </span>
                            )}
                            <Badge className={`text-xs ${getUrgencyColor(item.urgency)}`}>
                              {item.urgency}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p>No actions required</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
