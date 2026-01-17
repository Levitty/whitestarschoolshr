import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TenantWithStats, SUBSCRIPTION_TIERS } from '@/types/tenant';
import { CreditCard } from 'lucide-react';

interface ManageSubscriptionDialogProps {
  tenant: TenantWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tenantId: string, data: { subscription_tier: string; max_employees: number }) => Promise<void>;
}

const ManageSubscriptionDialog = ({ tenant, open, onOpenChange, onSave }: ManageSubscriptionDialogProps) => {
  const [tier, setTier] = useState('trial');
  const [maxEmployees, setMaxEmployees] = useState(50);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant) {
      setTier(tenant.subscription_tier);
      setMaxEmployees(tenant.max_employees);
    }
  }, [tenant]);

  const handleTierChange = (newTier: string) => {
    setTier(newTier);
    const tierConfig = SUBSCRIPTION_TIERS[newTier as keyof typeof SUBSCRIPTION_TIERS];
    if (tierConfig && tierConfig.maxEmployees !== -1) {
      setMaxEmployees(tierConfig.maxEmployees);
    }
  };

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      await onSave(tenant.id, { subscription_tier: tier, max_employees: maxEmployees });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Manage Subscription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: tenant.primary_color || '#3B82F6' }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{tenant.name}</p>
              <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subscription Tier</Label>
            <Select value={tier} onValueChange={handleTierChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">
                  <div className="flex items-center justify-between w-full">
                    <span>Trial</span>
                    <span className="text-muted-foreground ml-2">Free • 10 employees</span>
                  </div>
                </SelectItem>
                <SelectItem value="basic">
                  <div className="flex items-center justify-between w-full">
                    <span>Basic</span>
                    <span className="text-muted-foreground ml-2">$29/mo • 25 employees</span>
                  </div>
                </SelectItem>
                <SelectItem value="professional">
                  <div className="flex items-center justify-between w-full">
                    <span>Professional</span>
                    <span className="text-muted-foreground ml-2">$79/mo • 100 employees</span>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex items-center justify-between w-full">
                    <span>Enterprise</span>
                    <span className="text-muted-foreground ml-2">Custom • Unlimited</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Employees</Label>
            <Input 
              type="number"
              value={maxEmployees}
              onChange={(e) => setMaxEmployees(parseInt(e.target.value) || 0)}
              disabled={tier === 'enterprise'}
            />
            {tier === 'enterprise' && (
              <p className="text-xs text-muted-foreground">Enterprise tier has unlimited employees</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Update Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSubscriptionDialog;
