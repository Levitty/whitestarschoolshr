
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Users } from 'lucide-react';

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

const LeaveBalanceManager = () => {
  const { employees } = useEmployees();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    annual_leave_total: 21,
    annual_leave_used: 0,
    sick_leave_total: 10,
    sick_leave_used: 0,
    personal_leave_total: 5,
    personal_leave_used: 0
  });

  useEffect(() => {
    fetchLeaveBalances();
  }, []);

  const fetchLeaveBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching leave balances:', error);
      } else {
        setLeaveBalances(data || []);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }

    setLoading(true);

    try {
      // Check if balance already exists
      const { data: existingBalance, error: checkError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .eq('year', selectedYear)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingBalance) {
        // Update existing balance
        const { error } = await supabase
          .from('leave_balances')
          .update(balanceData)
          .eq('id', existingBalance.id);

        if (error) throw error;
        toast.success('Leave balance updated successfully');
      } else {
        // Create new balance
        const { error } = await supabase
          .from('leave_balances')
          .insert({
            employee_id: selectedEmployeeId,
            year: selectedYear,
            ...balanceData
          });

        if (error) throw error;
        toast.success('Leave balance created successfully');
      }

      await fetchLeaveBalances();
      // Reset form
      setSelectedEmployeeId('');
      setBalanceData({
        annual_leave_total: 21,
        annual_leave_used: 0,
        sick_leave_total: 10,
        sick_leave_used: 0,
        personal_leave_total: 5,
        personal_leave_used: 0
      });
    } catch (error) {
      console.error('Error managing leave balance:', error);
      toast.error('Failed to manage leave balance');
    } finally {
      setLoading(false);
    }
  };

  // Load existing balance when employee and year are selected
  useEffect(() => {
    if (selectedEmployeeId && selectedYear) {
      const existingBalance = leaveBalances.find(
        b => b.employee_id === selectedEmployeeId && b.year === selectedYear
      );
      if (existingBalance) {
        setBalanceData({
          annual_leave_total: existingBalance.annual_leave_total,
          annual_leave_used: existingBalance.annual_leave_used,
          sick_leave_total: existingBalance.sick_leave_total,
          sick_leave_used: existingBalance.sick_leave_used,
          personal_leave_total: existingBalance.personal_leave_total,
          personal_leave_used: existingBalance.personal_leave_used
        });
      }
    }
  }, [selectedEmployeeId, selectedYear, leaveBalances]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Manage Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">Annual Leave</h4>
                <div>
                  <Label htmlFor="annual_total">Total Days</Label>
                  <Input
                    id="annual_total"
                    type="number"
                    value={balanceData.annual_leave_total}
                    onChange={(e) => setBalanceData({
                      ...balanceData,
                      annual_leave_total: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="annual_used">Used Days</Label>
                  <Input
                    id="annual_used"
                    type="number"
                    value={balanceData.annual_leave_used}
                    onChange={(e) => setBalanceData({
                      ...balanceData,
                      annual_leave_used: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-orange-700">Sick Leave</h4>
                <div>
                  <Label htmlFor="sick_total">Total Days</Label>
                  <Input
                    id="sick_total"
                    type="number"
                    value={balanceData.sick_leave_total}
                    onChange={(e) => setBalanceData({
                      ...balanceData,
                      sick_leave_total: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="sick_used">Used Days</Label>
                  <Input
                    id="sick_used"
                    type="number"
                    value={balanceData.sick_leave_used}
                    onChange={(e) => setBalanceData({
                      ...balanceData,
                      sick_leave_used: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-purple-700">Personal Leave</h4>
                <div>
                  <Label htmlFor="personal_total">Total Days</Label>
                  <Input
                    id="personal_total"
                    type="number"
                    value={balanceData.personal_leave_total}
                    onChange={(e) => setBalanceData({
                      ...balanceData,
                      personal_leave_total: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="personal_used">Used Days</Label>
                  <Input
                    id="personal_used"
                    type="number"
                    value={balanceData.personal_leave_used}
                    onChange={(e) => setBalanceData({
                      ...balanceData,
                      personal_leave_used: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Leave Balance'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Leave Balances Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveBalances.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No leave balances found</p>
            ) : (
              leaveBalances.map((balance) => {
                const employee = employees.find(emp => emp.id === balance.employee_id);
                return (
                  <div key={balance.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                      </h4>
                      <span className="text-sm text-muted-foreground">Year: {balance.year}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-blue-700">Annual Leave</p>
                        <p>{balance.annual_leave_total - balance.annual_leave_used} / {balance.annual_leave_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-orange-700">Sick Leave</p>
                        <p>{balance.sick_leave_total - balance.sick_leave_used} / {balance.sick_leave_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-700">Personal Leave</p>
                        <p>{balance.personal_leave_total - balance.personal_leave_used} / {balance.personal_leave_total}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveBalanceManager;
