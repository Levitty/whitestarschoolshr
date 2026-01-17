import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TenantWithStats, SUBSCRIPTION_TIERS } from '@/types/tenant';
import { Building2, Users, Calendar, Mail, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface TenantDetailsDialogProps {
  tenant: TenantWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TenantDetailsDialog = ({ tenant, open, onOpenChange }: TenantDetailsDialogProps) => {
  if (!tenant) return null;

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basic': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tierInfo = SUBSCRIPTION_TIERS[tenant.subscription_tier as keyof typeof SUBSCRIPTION_TIERS];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: tenant.primary_color || '#3B82F6' }}
            >
              {tenant.name.charAt(0)}
            </div>
            {tenant.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status & Subscription */}
          <div className="flex items-center gap-3">
            <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
              {tenant.is_active ? 'Active' : 'Suspended'}
            </Badge>
            <Badge className={getTierBadgeColor(tenant.subscription_tier)}>
              {tenant.subscription_tier.charAt(0).toUpperCase() + tenant.subscription_tier.slice(1)}
            </Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> Slug
              </p>
              <p className="font-medium">/{tenant.slug}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Created
              </p>
              <p className="font-medium">{format(new Date(tenant.created_at), 'MMM d, yyyy')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Employees
              </p>
              <p className="font-medium">
                {tenant.employee_count || 0} / {tenant.max_employees === -1 ? '∞' : tenant.max_employees}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Users
              </p>
              <p className="font-medium">{tenant.user_count || 0}</p>
            </div>
          </div>

          {/* Subscription Details */}
          {tierInfo && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Subscription Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {tierInfo.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Settings */}
          {tenant.settings && Object.keys(tenant.settings).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Custom Settings</h4>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32">
                {JSON.stringify(tenant.settings, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDetailsDialog;
