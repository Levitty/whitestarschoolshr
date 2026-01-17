import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  CreditCard, 
  Ban, 
  UserPlus,
  Power,
  LogIn
} from 'lucide-react';
import { TenantWithStats } from '@/types/tenant';

interface TenantActionsDropdownProps {
  tenant: TenantWithStats;
  onViewDetails: (tenant: TenantWithStats) => void;
  onManageSubscription: (tenant: TenantWithStats) => void;
  onToggleActive: (tenantId: string, currentStatus: boolean) => void;
  onCreateAdmin: (tenant: TenantWithStats) => void;
}

const TenantActionsDropdown = ({
  tenant,
  onViewDetails,
  onManageSubscription,
  onToggleActive,
  onCreateAdmin,
}: TenantActionsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onViewDetails(tenant)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onManageSubscription(tenant)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Subscription
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCreateAdmin(tenant)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onToggleActive(tenant.id, tenant.is_active)}
          className={tenant.is_active ? 'text-destructive focus:text-destructive' : 'text-green-600 focus:text-green-600'}
        >
          {tenant.is_active ? (
            <>
              <Ban className="h-4 w-4 mr-2" />
              Suspend Access
            </>
          ) : (
            <>
              <Power className="h-4 w-4 mr-2" />
              Activate Tenant
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="opacity-50">
          <LogIn className="h-4 w-4 mr-2" />
          Impersonate Admin
          <span className="ml-auto text-xs text-muted-foreground">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantActionsDropdown;
