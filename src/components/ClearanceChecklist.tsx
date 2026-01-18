import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ClipboardCheck, 
  Monitor, 
  DollarSign, 
  Package,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  XCircle,
  Calculator,
  Laptop,
  Smartphone,
  Car,
  Key,
  Shirt,
  Wrench,
  CreditCard
} from 'lucide-react';
import { useClearance, Clearance, ClearanceItem } from '@/hooks/useClearance';
import { useAssets } from '@/hooks/useAssets';
import { useClearanceDeductions, ClearanceDeduction } from '@/hooks/useClearanceDeductions';
import { useToast } from '@/hooks/use-toast';
import { ClearanceApprovalWorkflow } from './ClearanceApprovalWorkflow';

interface ClearanceChecklistProps {
  employeeId: string;
  employeeName: string;
  employeeStatus: string;
  onUpdate?: () => void;
}

const DEPARTMENT_ICONS = {
  IT: Monitor,
  Finance: DollarSign,
  Operations: Package,
};

const DEPARTMENT_COLORS = {
  IT: 'text-blue-600 bg-blue-50 border-blue-200',
  Finance: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Operations: 'text-purple-600 bg-purple-50 border-purple-200',
};

const ASSET_ICONS: Record<string, any> = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Monitor,
  uniform: Shirt,
  vehicle: Car,
  tool: Wrench,
  access_card: CreditCard,
  keys: Key,
  other: Package,
};

interface EmployeeAsset {
  id: string;
  asset_name: string;
  asset_tag: string;
  asset_type: string;
  current_value: number;
  status: string;
}

const ClearanceChecklist = ({ 
  employeeId, 
  employeeName, 
  employeeStatus,
  onUpdate 
}: ClearanceChecklistProps) => {
  const [clearance, setClearance] = useState<Clearance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeAssets, setEmployeeAssets] = useState<EmployeeAsset[]>([]);
  const [deductions, setDeductions] = useState<ClearanceDeduction[]>([]);
  const [outstandingSalary, setOutstandingSalary] = useState<number>(0);
  const [leaveBalancePayout, setLeaveBalancePayout] = useState<number>(0);
  const [showDamagedDialog, setShowDamagedDialog] = useState<string | null>(null);
  const [showNotReturnedDialog, setShowNotReturnedDialog] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<EmployeeAsset | null>(null);
  const { toast } = useToast();
  
  const { loading, fetchClearance, initiateClearance, updateClearanceItem, completeClearance } = useClearance();
  const { fetchEmployeeAssets, returnAsset, updateAsset } = useAssets();
  const { fetchClearanceDeductions, addDeduction, calculateSettlement, loading: deductionLoading } = useClearanceDeductions();

  const shouldShowClearance = ['terminated', 'resigned', 'inactive'].includes(employeeStatus?.toLowerCase() || '');

  useEffect(() => {
    if (shouldShowClearance) {
      loadClearance();
    } else {
      setIsLoading(false);
    }
  }, [employeeId, employeeStatus]);

  const loadClearance = async () => {
    setIsLoading(true);
    let data = await fetchClearance(employeeId);
    
    // Auto-initiate clearance for resigned/terminated employees
    if (!data && shouldShowClearance) {
      data = await initiateClearance(employeeId);
    }
    
    setClearance(data);
    
    // Load employee's assigned assets
    const assets = await fetchEmployeeAssets(employeeId);
    setEmployeeAssets(assets || []);
    
    // Load existing deductions if clearance exists
    if (data?.id) {
      const deductionsList = await fetchClearanceDeductions(data.id);
      setDeductions(deductionsList);
      
      // Initialize settlement values
      setOutstandingSalary(data.outstanding_salary || 0);
      setLeaveBalancePayout(data.leave_balance_payout || 0);
    }
    
    setIsLoading(false);
  };

  const handleItemToggle = async (itemId: string, currentValue: boolean) => {
    const result = await updateClearanceItem(itemId, !currentValue);
    if (!result.error) {
      // Optimistic update
      setClearance(prev => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, is_completed: !currentValue } : item
          )
        };
      });
      onUpdate?.();
    }
  };

  const handleCompleteClearance = async () => {
    if (!clearance) return;
    await completeClearance(clearance.id);
    loadClearance();
    onUpdate?.();
  };

  const handleAssetReturnedOK = async (asset: EmployeeAsset) => {
    const success = await returnAsset(asset.id, 'good');
    if (success) {
      setEmployeeAssets(prev => prev.filter(a => a.id !== asset.id));
      toast({
        title: 'Asset Returned',
        description: `${asset.asset_name} has been marked as returned in good condition.`,
      });
      onUpdate?.();
    }
  };

  const handleAssetReturnedDamaged = async () => {
    if (!selectedAsset || !clearance) return;
    
    // Return asset as damaged
    const success = await returnAsset(selectedAsset.id, 'damaged');
    if (success) {
      // Add deduction for 50% of value
      const deductionAmount = selectedAsset.current_value * 0.5;
      const newDeduction = await addDeduction(clearance.id, {
        description: `${selectedAsset.asset_name} returned damaged`,
        amount: deductionAmount,
        deduction_type: 'asset_damaged',
        asset_id: selectedAsset.id,
      });
      
      if (newDeduction) {
        setDeductions(prev => [...prev, newDeduction]);
      }
      
      setEmployeeAssets(prev => prev.filter(a => a.id !== selectedAsset.id));
      
      toast({
        title: 'Asset Returned (Damaged)',
        description: `${selectedAsset.asset_name} returned with damage. Deduction of KES ${deductionAmount.toLocaleString()} added.`,
      });
    }
    setShowDamagedDialog(null);
    setSelectedAsset(null);
    onUpdate?.();
  };

  const handleAssetNotReturned = async () => {
    if (!selectedAsset || !clearance) return;
    
    // Update asset status to lost
    await updateAsset(selectedAsset.id, { status: 'lost', assigned_to: null });
    
    // Add deduction for 100% of value
    const newDeduction = await addDeduction(clearance.id, {
      description: `${selectedAsset.asset_name} not returned`,
      amount: selectedAsset.current_value,
      deduction_type: 'asset_not_returned',
      asset_id: selectedAsset.id,
    });
    
    if (newDeduction) {
      setDeductions(prev => [...prev, newDeduction]);
    }
    
    setEmployeeAssets(prev => prev.filter(a => a.id !== selectedAsset.id));
    
    toast({
      title: 'Asset Marked as Not Returned',
      description: `${selectedAsset.asset_name} marked as lost. Full value deduction of KES ${selectedAsset.current_value.toLocaleString()} added.`,
    });
    
    setShowNotReturnedDialog(null);
    setSelectedAsset(null);
    onUpdate?.();
  };

  const handleCalculateSettlement = async () => {
    if (!clearance) return;
    
    const result = await calculateSettlement(clearance.id, outstandingSalary, leaveBalancePayout);
    if (result) {
      // Refresh clearance data
      const updatedClearance = await fetchClearance(employeeId);
      setClearance(updatedClearance);
      
      toast({
        title: 'Settlement Calculated',
        description: 'Final settlement has been calculated and saved.',
      });
    }
  };

  if (!shouldShowClearance) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!clearance || !clearance.items) {
    return null;
  }

  const completedItems = clearance.items.filter(item => item.is_completed).length;
  const totalItems = clearance.items.length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isComplete = progressPercent === 100;

  // Group items by department
  const groupedItems = clearance.items.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = [];
    }
    acc[item.department].push(item);
    return acc;
  }, {} as Record<string, ClearanceItem[]>);

  // Calculate totals
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netSettlement = outstandingSalary + leaveBalancePayout - totalDeductions;

  return (
    <>
      <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Offboarding Clearance
            </CardTitle>
            <Badge 
              className={
                isComplete 
                  ? "bg-emerald-500 text-white" 
                  : "bg-orange-500 text-white"
              }
            >
              {clearance.status === 'completed' ? 'Completed' : `${progressPercent.toFixed(0)}% Complete`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Offboarding clearance for {employeeName} ({employeeStatus})
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Clearance Progress</span>
              <span className="font-semibold">{completedItems} / {totalItems} items</span>
            </div>
            <Progress 
              value={progressPercent} 
              className={`h-3 ${isComplete ? 'bg-emerald-100' : 'bg-orange-100'}`}
            />
          </div>

          {/* Assets to Return Section */}
          {employeeAssets.length > 0 && (
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-amber-800 dark:text-amber-400">
                  Assets to Return ({employeeAssets.length})
                </h4>
              </div>
              
              <div className="space-y-3">
                {employeeAssets.map(asset => {
                  const AssetIcon = ASSET_ICONS[asset.asset_type] || Package;
                  return (
                    <div 
                      key={asset.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-card border"
                    >
                      <div className="flex items-center gap-3">
                        <AssetIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{asset.asset_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {asset.asset_tag} • KES {asset.current_value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => handleAssetReturnedOK(asset)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          OK
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowDamagedDialog(asset.id);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Damaged
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowNotReturnedDialog(asset.id);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Not Returned
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Department Sections */}
          {Object.entries(groupedItems).map(([department, items]) => {
            const DeptIcon = DEPARTMENT_ICONS[department as keyof typeof DEPARTMENT_ICONS] || Package;
            const deptColors = DEPARTMENT_COLORS[department as keyof typeof DEPARTMENT_COLORS] || '';
            const deptComplete = items.every(item => item.is_completed);

            return (
              <div 
                key={department}
                className={`p-4 rounded-xl border-2 ${deptColors}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <DeptIcon className="h-5 w-5" />
                  <h4 className="font-semibold">{department} Department</h4>
                  {deptComplete && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                  )}
                </div>
                
                <div className="space-y-3">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-card/50"
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.is_completed}
                        onCheckedChange={() => handleItemToggle(item.id, item.is_completed)}
                        disabled={clearance.status === 'completed'}
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm font-medium cursor-pointer ${
                          item.is_completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item.item_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <Separator />

          {/* Department Approval Workflow */}
          <ClearanceApprovalWorkflow 
            clearanceId={clearance.id}
            onFullyApproved={() => loadClearance()}
          />

          <Separator />

          {/* Final Settlement Card */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-400">Final Settlement Calculation</h4>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outstandingSalary">Outstanding Salary (KES)</Label>
                  <Input
                    id="outstandingSalary"
                    type="number"
                    value={outstandingSalary}
                    onChange={(e) => setOutstandingSalary(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="leaveBalancePayout">Leave Balance Payout (KES)</Label>
                  <Input
                    id="leaveBalancePayout"
                    type="number"
                    value={leaveBalancePayout}
                    onChange={(e) => setLeaveBalancePayout(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Deductions List */}
              {deductions.length > 0 && (
                <div className="space-y-2">
                  <Label>Deductions</Label>
                  <div className="space-y-1 bg-white dark:bg-card p-3 rounded-lg border">
                    {deductions.map(d => (
                      <div key={d.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{d.description}</span>
                        <span className="text-red-600 font-medium">- KES {d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Deductions</span>
                      <span className="text-red-600">KES {totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Settlement */}
              <div className={`p-4 rounded-lg ${netSettlement >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-red-100 dark:bg-red-950/30'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Settlement</span>
                  <span className={`text-xl font-bold ${netSettlement >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    KES {Math.abs(netSettlement).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${netSettlement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {netSettlement >= 0 
                    ? 'Company owes employee' 
                    : 'Employee owes company'}
                </p>
              </div>

              <Button 
                onClick={handleCalculateSettlement}
                className="w-full"
                disabled={loading || deductionLoading}
              >
                {(loading || deductionLoading) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Calculator className="h-4 w-4 mr-2" />
                Calculate & Save Settlement
              </Button>
            </div>
          </div>

          {/* Complete Clearance Button */}
          {isComplete && employeeAssets.length === 0 && clearance.status !== 'completed' && (
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCompleteClearance}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Clearance as Complete
            </Button>
          )}

          {clearance.status === 'completed' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                Clearance Completed
              </p>
              <p className="text-xs text-muted-foreground">
                Completed on {clearance.completed_at ? new Date(clearance.completed_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Damaged Asset Dialog */}
      <AlertDialog open={!!showDamagedDialog} onOpenChange={() => setShowDamagedDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Damaged Asset Return</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAsset && (
                <>
                  <p className="mb-2">
                    <strong>{selectedAsset.asset_name}</strong> ({selectedAsset.asset_tag}) will be marked as returned with damage.
                  </p>
                  <p className="text-amber-600 font-semibold">
                    Deduction: 50% of value = KES {(selectedAsset.current_value * 0.5).toLocaleString()}
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssetReturnedDamaged} className="bg-amber-600 hover:bg-amber-700">
              Confirm Damaged Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Not Returned Asset Dialog */}
      <AlertDialog open={!!showNotReturnedDialog} onOpenChange={() => setShowNotReturnedDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Asset Not Returned</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAsset && (
                <>
                  <p className="mb-2">
                    <strong>{selectedAsset.asset_name}</strong> ({selectedAsset.asset_tag}) will be marked as lost/not returned.
                  </p>
                  <p className="text-red-600 font-semibold">
                    Deduction: 100% of value = KES {selectedAsset.current_value.toLocaleString()}
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssetNotReturned} className="bg-red-600 hover:bg-red-700">
              Confirm Not Returned
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClearanceChecklist;