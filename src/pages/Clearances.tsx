import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import { useTenant } from '@/contexts/TenantContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useClearance } from '@/hooks/useClearance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserMinus, AlertTriangle, Plus, Monitor, DollarSign, Package, Users, Check, X, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClearanceChecklist from '@/components/ClearanceChecklist';
import { ClearanceApprovalWorkflow } from '@/components/ClearanceApprovalWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface ClearanceWithEmployee {
  id: string;
  employee_id: string;
  status: string;
  initiated_at: string;
  completed_at: string | null;
  settlement_status: string;
  outstanding_salary: number;
  leave_balance_payout: number;
  total_deductions: number;
  final_settlement_amount: number;
  tenant_id: string;
  employee_profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    status: string;
    department: string;
    position: string;
    employee_number: string;
  };
}

const Clearances = () => {
  const { isCorporate } = useTenantLabels();
  const { tenant } = useTenant();
  const { employees } = useEmployees();
  const { initiateClearance, loading: clearanceLoading } = useClearance();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);
  const [selectedClearance, setSelectedClearance] = useState<ClearanceWithEmployee | null>(null);

  // Fetch all clearances with employee data
  const { data: clearances = [], refetch: refetchClearances } = useQuery({
    queryKey: ['clearances', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('offboarding_clearance')
        .select(`
          *,
          employee_profile:employee_profiles!offboarding_clearance_employee_id_fkey(
            id, first_name, last_name, email, avatar_url, status, department, position, employee_number
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('initiated_at', { ascending: false });

      if (error) throw error;
      return data as ClearanceWithEmployee[];
    },
    enabled: !!tenant?.id
  });

  // Only show for corporate tenants
  if (!isCorporate) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter active employees only
  const activeEmployees = employees.filter(emp => 
    emp.status === 'active' && 
    (emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInitiateClearance = async () => {
    if (!selectedEmployee) return;

    const result = await initiateClearance(selectedEmployee.id);
    
    if (result) {
      toast({
        title: "Clearance Initiated",
        description: `Offboarding clearance has been started for ${selectedEmployee.first_name} ${selectedEmployee.last_name}.`,
      });
      setShowInitiateDialog(false);
      setSelectedEmployee(null);
      refetchClearances();
    } else {
      toast({
        title: "Error",
        description: "Failed to initiate clearance. Please try again.",
        variant: "destructive"
      });
    }
  };

  const inProgressClearances = clearances.filter(c => c.status === 'in_progress');
  const completedClearances = clearances.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Offboarding Clearances</h1>
          <p className="text-muted-foreground">
            Track and manage employee offboarding, clearances, and final settlements.
          </p>
        </div>
        <Button onClick={() => setShowInitiateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Initiate Clearance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clearances.length}</p>
                <p className="text-xs text-muted-foreground">Total Clearances</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressClearances.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedClearances.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {clearances.filter(c => c.settlement_status === 'pending_calculation' || c.settlement_status === 'calculated').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Settlement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clearances Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Clearances
            {inProgressClearances.length > 0 && (
              <Badge variant="secondary" className="ml-2">{inProgressClearances.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedClearances.length > 0 && (
              <Badge variant="secondary" className="ml-2">{completedClearances.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {inProgressClearances.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-medium text-muted-foreground">No Active Clearances</h4>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Click "Initiate Clearance" to start an offboarding process.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {inProgressClearances.map((clearance) => (
                <ClearanceCard 
                  key={clearance.id} 
                  clearance={clearance} 
                  onSelect={() => setSelectedClearance(clearance)}
                  isSelected={selectedClearance?.id === clearance.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedClearances.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-medium text-muted-foreground">No Completed Clearances</h4>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Completed clearances will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedClearances.map((clearance) => (
                <ClearanceCard 
                  key={clearance.id} 
                  clearance={clearance} 
                  onSelect={() => setSelectedClearance(clearance)}
                  isSelected={selectedClearance?.id === clearance.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected Clearance Details */}
      {selectedClearance && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedClearance.employee_profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedClearance.employee_profile?.first_name?.charAt(0)}
                      {selectedClearance.employee_profile?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {selectedClearance.employee_profile?.first_name} {selectedClearance.employee_profile?.last_name}
                    </CardTitle>
                    <CardDescription>
                      {selectedClearance.employee_profile?.position} • {selectedClearance.employee_profile?.department}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={selectedClearance.status === 'completed' ? 'default' : 'secondary'}>
                  {selectedClearance.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Clearance Checklist */}
          <ClearanceChecklist 
            employeeId={selectedClearance.employee_id}
            employeeName={`${selectedClearance.employee_profile?.first_name} ${selectedClearance.employee_profile?.last_name}`}
            employeeStatus={selectedClearance.employee_profile?.status || 'resigned'}
            onUpdate={() => refetchClearances()}
          />

          {/* Department Approvals Workflow */}
          <ClearanceApprovalWorkflow 
            clearanceId={selectedClearance.id}
            onFullyApproved={() => {
              toast({
                title: "All Departments Approved",
                description: "The clearance has been approved by all departments.",
              });
              refetchClearances();
            }}
          />

          {/* Final Settlement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Final Settlement Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Outstanding Salary (KES)</p>
                  <p className="text-xl font-semibold mt-1">
                    {Number(selectedClearance.outstanding_salary || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Leave Balance Payout (KES)</p>
                  <p className="text-xl font-semibold mt-1">
                    {Number(selectedClearance.leave_balance_payout || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">Total Deductions (KES)</p>
                  <p className="text-xl font-semibold mt-1 text-red-700 dark:text-red-300">
                    -{Number(selectedClearance.total_deductions || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Net Settlement (KES)</p>
                  <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                    {Number(selectedClearance.final_settlement_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Initiate Clearance Dialog */}
      <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5" />
              Initiate Employee Clearance
            </DialogTitle>
            <DialogDescription>
              Select an employee to start the offboarding clearance process. This will notify all relevant departments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name or department..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Employee List */}
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
              {activeEmployees.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No employees found matching your search.</p>
                </div>
              ) : (
                activeEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedEmployee?.id === employee.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar_url || undefined} />
                      <AvatarFallback>
                        {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {employee.position} • {employee.department}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {employee.employee_number}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            {selectedEmployee && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Confirm Clearance Initiation
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      You are about to initiate offboarding clearance for{' '}
                      <strong>{selectedEmployee.first_name} {selectedEmployee.last_name}</strong>.
                      This will create clearance tasks for all departments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowInitiateDialog(false);
              setSelectedEmployee(null);
              setSearchTerm('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleInitiateClearance}
              disabled={!selectedEmployee || clearanceLoading}
              variant="destructive"
            >
              {clearanceLoading ? 'Initiating...' : 'Initiate Clearance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Clearance Card Component
const ClearanceCard = ({ 
  clearance, 
  onSelect, 
  isSelected 
}: { 
  clearance: ClearanceWithEmployee; 
  onSelect: () => void;
  isSelected: boolean;
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={clearance.employee_profile?.avatar_url || undefined} />
              <AvatarFallback>
                {clearance.employee_profile?.first_name?.charAt(0)}
                {clearance.employee_profile?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {clearance.employee_profile?.first_name} {clearance.employee_profile?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {clearance.employee_profile?.position} • {clearance.employee_profile?.department}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={clearance.employee_profile?.status === 'terminated' ? 'destructive' : 'secondary'} className="capitalize">
              {clearance.employee_profile?.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Initiated: {format(new Date(clearance.initiated_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Clearances;
