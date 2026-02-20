import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Users, Settings } from 'lucide-react';

interface LeaveSettings {
  id: string;
  year: number;
  annual_leave_total: number;
  sick_leave_total: number;
  maternity_leave_total: number;
  study_leave_total: number;
  unpaid_leave_total: number;
}

interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  maternity_leave_total: number;
  maternity_leave_used: number;
  study_leave_total: number;
  study_leave_used: number;
  unpaid_leave_total: number;
  unpaid_leave_used: number;
}

const LeaveBalanceManager = () => {
  const { employees } = useEmployees();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [settingsData, setSettingsData] = useState({
    annual_leave_total: 21,
    sick_leave_total: 10,
    maternity_leave_total: 90,
    study_leave_total: 10,
    unpaid_leave_total: 30
  });

  useEffect(() => {
    fetchLeaveSettings();
    fetchLeaveBalances();
  }, [selectedYear]);

  const fetchLeaveSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_settings')
        .select('*')
        .eq('year', selectedYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching leave settings:', error);
      } else if (data) {
        setSettingsData({
          annual_leave_total: data.annual_leave_total,
          sick_leave_total: data.sick_leave_total,
          maternity_leave_total: data.maternity_leave_total,
          study_leave_total: data.study_leave_total,
          unpaid_leave_total: data.unpaid_leave_total
        });
      }
    } catch (error) {
      console.error('Error fetching leave settings:', error);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('year', selectedYear)
        .order('employee_id');

      if (error) {
        console.error('Error fetching leave balances:', error);
      } else {
        setLeaveBalances(data || []);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if settings already exist for this year
      const { data: existingSettings, error: checkError } = await supabase
        .from('leave_settings')
        .select('*')
        .eq('year', selectedYear)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('leave_settings')
          .update({
            ...settingsData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('leave_settings')
          .insert({
            year: selectedYear,
            ...settingsData
          });

        if (error) throw error;
      }

      toast.success('Leave settings saved successfully');
    } catch (error) {
      console.error('Error saving leave settings:', error);
      toast.error('Failed to save leave settings');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToAllEmployees = async () => {
    if (employees.length === 0) {
      toast.error('No employees found');
      return;
    }

    setLoading(true);

    try {
      // Create or update leave balances for all employees
      for (const employee of employees) {
        const existingBalance = leaveBalances.find(b => b.employee_id === employee.id);

        if (existingBalance) {
          // Update existing balance with new totals (keep used values)
          const { error } = await supabase
            .from('leave_balances')
            .update({
              annual_leave_total: settingsData.annual_leave_total,
              sick_leave_total: settingsData.sick_leave_total,
              maternity_leave_total: settingsData.maternity_leave_total,
              study_leave_total: settingsData.study_leave_total,
              unpaid_leave_total: settingsData.unpaid_leave_total,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingBalance.id);

          if (error) throw error;
        } else {
          // Create new balance
          const { error } = await supabase
            .from('leave_balances')
            .insert({
              employee_id: employee.id,
              year: selectedYear,
              annual_leave_total: settingsData.annual_leave_total,
              annual_leave_used: 0,
              sick_leave_total: settingsData.sick_leave_total,
              sick_leave_used: 0,
              maternity_leave_total: settingsData.maternity_leave_total,
              maternity_leave_used: 0,
              study_leave_total: settingsData.study_leave_total,
              study_leave_used: 0,
              unpaid_leave_total: settingsData.unpaid_leave_total,
              unpaid_leave_used: 0
            });

          if (error) throw error;
        }
      }

      await fetchLeaveBalances();
      toast.success(`Leave balances applied to ${employees.length} employees`);
    } catch (error) {
      console.error('Error applying leave balances:', error);
      toast.error('Failed to apply leave balances to all employees');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Leave Settings for {selectedYear}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set leave allowances that will apply to all employees
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[200px]">
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">Annual Leave</h4>
                <Label htmlFor="annual_total">Total Days</Label>
                <Input
                  id="annual_total"
                  type="number"
                  value={settingsData.annual_leave_total}
                  onChange={(e) => setSettingsData({
                    ...settingsData,
                    annual_leave_total: parseInt(e.target.value) || 0
                  })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-orange-700">Sick Leave</h4>
                <Label htmlFor="sick_total">Total Days</Label>
                <Input
                  id="sick_total"
                  type="number"
                  value={settingsData.sick_leave_total}
                  onChange={(e) => setSettingsData({
                    ...settingsData,
                    sick_leave_total: parseInt(e.target.value) || 0
                  })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-pink-700">Maternity Leave</h4>
                <Label htmlFor="maternity_total">Total Days</Label>
                <Input
                  id="maternity_total"
                  type="number"
                  value={settingsData.maternity_leave_total}
                  onChange={(e) => setSettingsData({
                    ...settingsData,
                    maternity_leave_total: parseInt(e.target.value) || 0
                  })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-purple-700">Study Leave</h4>
                <Label htmlFor="study_total">Total Days</Label>
                <Input
                  id="study_total"
                  type="number"
                  value={settingsData.study_leave_total}
                  onChange={(e) => setSettingsData({
                    ...settingsData,
                    study_leave_total: parseInt(e.target.value) || 0
                  })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Unpaid Leave</h4>
                <Label htmlFor="unpaid_total">Total Days</Label>
                <Input
                  id="unpaid_total"
                  type="number"
                  value={settingsData.unpaid_leave_total}
                  onChange={(e) => setSettingsData({
                    ...settingsData,
                    unpaid_leave_total: parseInt(e.target.value) || 0
                  })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleApplyToAllEmployees}
                disabled={loading}
              >
                {loading ? 'Applying...' : `Apply to All Employees (${employees.length})`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Leave Balances Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Leave Balances - {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveBalances.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No leave balances found for {selectedYear}. Click "Apply to All Employees" to create them.
              </p>
            ) : (
              leaveBalances.map((balance) => {
                const employee = employees.find(emp => emp.id === balance.employee_id);
                return (
                  <div key={balance.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {employee
                          ? (employee.first_name || employee.last_name
                              ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
                              : (employee as any).email || 'Unknown Employee')
                          : 'Unknown Employee'}
                      </h4>
                      <span className="text-sm text-muted-foreground">{employee?.department}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-blue-700">Annual</p>
                        <p>{balance.annual_leave_total - balance.annual_leave_used} / {balance.annual_leave_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-orange-700">Sick</p>
                        <p>{balance.sick_leave_total - balance.sick_leave_used} / {balance.sick_leave_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-pink-700">Maternity</p>
                        <p>{balance.maternity_leave_total - balance.maternity_leave_used} / {balance.maternity_leave_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-700">Study</p>
                        <p>{balance.study_leave_total - balance.study_leave_used} / {balance.study_leave_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Unpaid</p>
                        <p>{balance.unpaid_leave_total - balance.unpaid_leave_used} / {balance.unpaid_leave_total}</p>
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