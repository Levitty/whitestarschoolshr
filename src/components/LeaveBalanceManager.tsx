
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Clock, Plus } from 'lucide-react';

type LeaveBalance = Database['public']['Tables']['leave_balances']['Row'];

const LeaveBalanceManager = () => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBalance, setNewBalance] = useState({
    employee_id: '',
    year: new Date().getFullYear(),
    annual_leave_total: 21,
    sick_leave_total: 10,
    personal_leave_total: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveBalances();
  }, []);

  const fetchLeaveBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('year', new Date().getFullYear())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave balances:', error);
      } else {
        setLeaveBalances(data || []);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLeaveBalance = async () => {
    try {
      const { error } = await supabase
        .from('leave_balances')
        .insert(newBalance);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create leave balance record.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Leave balance record created successfully!"
        });
        await fetchLeaveBalances();
        setNewBalance({
          employee_id: '',
          year: new Date().getFullYear(),
          annual_leave_total: 21,
          sick_leave_total: 10,
          personal_leave_total: 5
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create leave balance record.",
        variant: "destructive"
      });
    }
  };

  const getLeaveUsagePercentage = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <div className="text-center py-8">Loading leave balances...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-slate-600">Manage employee leave balances and track usage</p>
        </div>
      </div>

      {/* Create New Leave Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Set Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Employee ID</Label>
              <Input
                value={newBalance.employee_id}
                onChange={(e) => setNewBalance(prev => ({ ...prev, employee_id: e.target.value }))}
                placeholder="Employee UUID"
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={newBalance.year}
                onChange={(e) => setNewBalance(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Annual Leave</Label>
              <Input
                type="number"
                value={newBalance.annual_leave_total}
                onChange={(e) => setNewBalance(prev => ({ ...prev, annual_leave_total: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Sick Leave</Label>
              <Input
                type="number"
                value={newBalance.sick_leave_total}
                onChange={(e) => setNewBalance(prev => ({ ...prev, sick_leave_total: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createLeaveBalance} className="w-full">
                Set Balance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Balances Overview */}
      <div className="grid gap-6">
        {leaveBalances.map((balance) => (
          <Card key={balance.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Employee: {balance.employee_id?.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm text-gray-600">{balance.year}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Annual Leave */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Annual Leave</span>
                    <Badge variant="outline">
                      {balance.annual_leave_used || 0}/{balance.annual_leave_total || 0} days
                    </Badge>
                  </div>
                  <Progress 
                    value={getLeaveUsagePercentage(balance.annual_leave_used || 0, balance.annual_leave_total || 0)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Used: {balance.annual_leave_used || 0}</span>
                    <span>Remaining: {(balance.annual_leave_total || 0) - (balance.annual_leave_used || 0)}</span>
                  </div>
                </div>

                {/* Sick Leave */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sick Leave</span>
                    <Badge variant="outline">
                      {balance.sick_leave_used || 0}/{balance.sick_leave_total || 0} days
                    </Badge>
                  </div>
                  <Progress 
                    value={getLeaveUsagePercentage(balance.sick_leave_used || 0, balance.sick_leave_total || 0)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Used: {balance.sick_leave_used || 0}</span>
                    <span>Remaining: {(balance.sick_leave_total || 0) - (balance.sick_leave_used || 0)}</span>
                  </div>
                </div>

                {/* Personal Leave */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Personal Leave</span>
                    <Badge variant="outline">
                      {balance.personal_leave_used || 0}/{balance.personal_leave_total || 0} days
                    </Badge>
                  </div>
                  <Progress 
                    value={getLeaveUsagePercentage(balance.personal_leave_used || 0, balance.personal_leave_total || 0)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Used: {balance.personal_leave_used || 0}</span>
                    <span>Remaining: {(balance.personal_leave_total || 0) - (balance.personal_leave_used || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaveBalances.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Records</h3>
            <p className="text-gray-600">Set up leave balances for employees to start tracking.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveBalanceManager;
