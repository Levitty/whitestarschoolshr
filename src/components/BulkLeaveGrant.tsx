import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Search } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Study', 'Unpaid'];

const BulkLeaveGrant = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { employees, loading: employeesLoading } = useEmployees();

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeEmployees = employees.filter(e => e.status === 'active');

  const filteredEmployees = activeEmployees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const allSelected = filteredEmployees.length > 0 && filteredEmployees.every(e => selectedEmployees.has(e.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedEmployees);
      filteredEmployees.forEach(e => newSet.delete(e.id));
      setSelectedEmployees(newSet);
    } else {
      const newSet = new Set(selectedEmployees);
      filteredEmployees.forEach(e => newSet.add(e.id));
      setSelectedEmployees(newSet);
    }
  };

  const toggleEmployee = (id: string) => {
    const newSet = new Set(selectedEmployees);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEmployees(newSet);
  };

  const daysRequested = startDate && endDate
    ? differenceInCalendarDays(endDate, startDate) + 1
    : 0;

  const canSubmit = leaveType && startDate && endDate && daysRequested > 0 && reason.trim() && selectedEmployees.size > 0 && !submitting;

  const handleGrant = async () => {
    if (!canSubmit || !user || !tenant?.id) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const startStr = format(startDate!, 'yyyy-MM-dd');
      const endStr = format(endDate!, 'yyyy-MM-dd');

      // We need to map employee_profiles id -> profile_id for leave_requests.employee_id
      const selectedEmps = activeEmployees.filter(e => selectedEmployees.has(e.id));

      const records = selectedEmps.map(emp => ({
        employee_id: emp.profile_id || emp.id, // use profile_id if linked, else fallback
        leave_type: leaveType,
        start_date: startStr,
        end_date: endStr,
        days_requested: daysRequested,
        reason,
        status: 'approved',
        workflow_stage: 'completed',
        approved_by: user.id,
        approved_at: now,
        tenant_id: tenant.id,
      }));

      const { error } = await supabase
        .from('leave_requests')
        .insert(records as any);

      if (error) {
        console.error('Bulk leave grant error:', error);
        toast({ title: 'Error', description: 'Failed to grant leave. ' + error.message, variant: 'destructive' });
        return;
      }

      // Now deduct balances for each employee
      const currentYear = new Date().getFullYear();
      const leaveFieldMap: Record<string, string> = {
        'Annual': 'annual_leave_used',
        'Sick': 'sick_leave_used',
        'Maternity': 'maternity_leave_used',
        'Study': 'study_leave_used',
        'Unpaid': 'unpaid_leave_used',
      };
      const balanceField = leaveFieldMap[leaveType];

      if (balanceField) {
        for (const emp of selectedEmps) {
          const { data: balance } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', emp.id)
            .eq('year', currentYear)
            .maybeSingle();

          if (balance) {
            const currentUsed = (balance as any)[balanceField] || 0;
            await supabase
              .from('leave_balances')
              .update({ [balanceField]: currentUsed + daysRequested } as any)
              .eq('id', balance.id);
          }
        }
      }

      toast({ title: 'Success', description: `Leave granted to ${selectedEmps.length} employee(s).` });

      // Reset form
      setLeaveType('');
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      setSelectedEmployees(new Set());
    } catch (err) {
      console.error('Bulk leave grant error:', err);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Leave Grant
        </CardTitle>
        <p className="text-sm text-muted-foreground">Grant leave to multiple employees at once (e.g. midterm breaks)</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Leave Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {daysRequested > 0 && (
          <p className="text-sm text-muted-foreground">Duration: <span className="font-medium text-foreground">{daysRequested} day(s)</span></p>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason</Label>
          <Input placeholder="e.g. Midterm Break Term 1" value={reason} onChange={e => setReason(e.target.value)} />
        </div>

        {/* Employee Selection */}
        <div className="space-y-3">
          <Label>Select Employees ({selectedEmployees.size} selected)</Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <div className="flex items-center gap-2 py-1 border-b">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="select-all" />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">Select All ({filteredEmployees.length})</label>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {employeesLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading employees...</p>
            ) : filteredEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No employees found</p>
            ) : (
              filteredEmployees.map(emp => (
                <div key={emp.id} className="flex items-center gap-2 py-1.5 px-1 rounded hover:bg-muted/50">
                  <Checkbox
                    checked={selectedEmployees.has(emp.id)}
                    onCheckedChange={() => toggleEmployee(emp.id)}
                    id={`emp-${emp.id}`}
                  />
                  <label htmlFor={`emp-${emp.id}`} className="text-sm cursor-pointer flex-1">
                    {emp.first_name} {emp.last_name}
                    <span className="text-muted-foreground ml-2">— {emp.department}</span>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <Button onClick={handleGrant} disabled={!canSubmit} className="w-full">
          {submitting ? 'Granting Leave...' : `Grant Leave to ${selectedEmployees.size} Employee(s)`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkLeaveGrant;
