import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User } from 'lucide-react';
import { useAssets, ConditionOnAssign } from '@/hooks/useAssets';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface AssetAssignmentDialogProps {
  assetId: string;
  assetName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CONDITIONS: { value: ConditionOnAssign; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const AssetAssignmentDialog = ({
  assetId,
  assetName,
  open,
  onOpenChange,
  onSuccess,
}: AssetAssignmentDialogProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [condition, setCondition] = useState<ConditionOnAssign>('good');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignAsset } = useAssets();

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('is_active', true)
        .order('first_name');

      if (!error && data) {
        setEmployees(data);
        setFilteredEmployees(data);
      }
    };

    if (open) {
      fetchEmployees();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp => {
        const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || 
               emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const handleSubmit = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    const success = await assignAsset(assetId, selectedEmployee, condition, notes);
    setIsSubmitting(false);

    if (success) {
      setSelectedEmployee('');
      setCondition('good');
      setNotes('');
      setSearchTerm('');
      onOpenChange(false);
      onSuccess();
    }
  };

  const selectedEmp = employees.find(e => e.id === selectedEmployee);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign "{assetName}" to an employee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Employee</Label>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee">
                  {selectedEmp && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedEmp.avatar_url || undefined} />
                        <AvatarFallback>
                          {selectedEmp.first_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedEmp.first_name} {selectedEmp.last_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={emp.avatar_url || undefined} />
                        <AvatarFallback>
                          {emp.first_name?.charAt(0) || <User className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">
                          {emp.first_name} {emp.last_name}
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">
                          {emp.email}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condition on Assignment</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as ConditionOnAssign)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Any notes about this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedEmployee || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetAssignmentDialog;
