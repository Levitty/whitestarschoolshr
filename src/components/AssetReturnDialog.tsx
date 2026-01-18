import { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Ban } from 'lucide-react';
import { useAssets, ConditionOnReturn, CompanyAsset } from '@/hooks/useAssets';

interface AssetReturnDialogProps {
  asset: CompanyAsset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (condition: ConditionOnReturn, deductionAmount: number) => void;
}

const CONDITIONS: { value: ConditionOnReturn; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: 'text-emerald-600' },
  { value: 'good', label: 'Good', color: 'text-green-600' },
  { value: 'fair', label: 'Fair', color: 'text-yellow-600' },
  { value: 'poor', label: 'Poor', color: 'text-orange-600' },
  { value: 'damaged', label: 'Damaged', color: 'text-red-600' },
  { value: 'lost', label: 'Lost / Not Returned', color: 'text-red-700' },
];

const AssetReturnDialog = ({
  asset,
  open,
  onOpenChange,
  onSuccess,
}: AssetReturnDialogProps) => {
  const [condition, setCondition] = useState<ConditionOnReturn>('good');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { returnAsset } = useAssets();

  const getDeductionAmount = (cond: ConditionOnReturn): number => {
    if (cond === 'damaged') return asset.current_value * 0.5;
    if (cond === 'lost') return asset.current_value;
    return 0;
  };

  const deductionAmount = getDeductionAmount(condition);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await returnAsset(asset.id, condition, notes);
    setIsSubmitting(false);

    if (success) {
      onSuccess(condition, deductionAmount);
      setCondition('good');
      setNotes('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            Process the return of "{asset.asset_name}" ({asset.asset_tag})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="text-sm font-medium">{asset.asset_name}</p>
            <p className="text-xs text-muted-foreground">Tag: {asset.asset_tag}</p>
            <p className="text-xs text-muted-foreground">
              Current Value: <span className="font-semibold">KES {asset.current_value.toLocaleString()}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Condition on Return</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as ConditionOnReturn)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className={c.color}>{c.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {condition === 'damaged' && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                <strong>50% Deduction:</strong> KES {deductionAmount.toLocaleString()} will be deducted from the employee's final settlement.
              </AlertDescription>
            </Alert>
          )}

          {condition === 'lost' && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <Ban className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-300">
                <strong>Full Deduction:</strong> KES {deductionAmount.toLocaleString()} will be deducted from the employee's final settlement.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Describe the condition or any issues..."
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
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            variant={condition === 'damaged' || condition === 'lost' ? 'destructive' : 'default'}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {condition === 'lost' ? 'Mark as Lost' : 'Process Return'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetReturnDialog;
