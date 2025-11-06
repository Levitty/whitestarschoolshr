import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, TrendingDown } from 'lucide-react';

interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  personal_leave_total: number;
  personal_leave_used: number;
}

const MyLeaveBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      fetchMyBalance();
    }
  }, [user]);

  const fetchMyBalance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get the employee profile
      const { data: employeeProfile, error: profileError } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching employee profile:', profileError);
        toast.error('Failed to load employee profile');
        return;
      }

      if (!employeeProfile) {
        toast.error('Employee profile not found');
        return;
      }

      // Then get the leave balance
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employeeProfile.id)
        .eq('year', currentYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching leave balance:', error);
        toast.error('Failed to load leave balance');
        return;
      }

      setBalance(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading leave balance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No leave balance found for {currentYear}. Please contact your administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const leaveTypes = [
    {
      type: 'Annual Leave',
      total: balance.annual_leave_total,
      used: balance.annual_leave_used,
      remaining: balance.annual_leave_total - balance.annual_leave_used,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'Sick Leave',
      total: balance.sick_leave_total,
      used: balance.sick_leave_used,
      remaining: balance.sick_leave_total - balance.sick_leave_used,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      type: 'Personal Leave',
      total: balance.personal_leave_total,
      used: balance.personal_leave_used,
      remaining: balance.personal_leave_total - balance.personal_leave_used,
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave Balance - {currentYear}</CardTitle>
        <p className="text-sm text-muted-foreground">View your available leave days</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveTypes.map((leave) => {
            const Icon = leave.icon;
            const percentageUsed = leave.total > 0 ? (leave.used / leave.total) * 100 : 0;
            
            return (
              <div key={leave.type} className={`p-4 rounded-lg ${leave.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${leave.color}`} />
                  <span className={`text-2xl font-bold ${leave.color}`}>
                    {leave.remaining}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{leave.type}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {leave.used} used of {leave.total} days
                </p>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${leave.color.replace('text', 'bg')}`}
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyLeaveBalance;
