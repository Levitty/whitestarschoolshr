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
import { Search, UserMinus, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClearanceDashboard from '@/components/ClearanceDashboard';

const Clearances = () => {
  const { isCorporate } = useTenantLabels();
  const { tenant } = useTenant();
  const { employees } = useEmployees();
  const { initiateClearance, loading: clearanceLoading } = useClearance();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);

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
    } else {
      toast({
        title: "Error",
        description: "Failed to initiate clearance. Please try again.",
        variant: "destructive"
      });
    }
  };

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

      {/* Clearance Dashboard */}
      <ClearanceDashboard />

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

export default Clearances;