import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantWithStats } from '@/types/tenant';
import { Search, Copy, ExternalLink, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import TenantActionsDropdown from './TenantActionsDropdown';

interface TenantsTableProps {
  tenants: TenantWithStats[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTenant: () => void;
  onViewDetails: (tenant: TenantWithStats) => void;
  onManageSubscription: (tenant: TenantWithStats) => void;
  onToggleActive: (tenantId: string, currentStatus: boolean) => void;
  onCreateAdmin: (tenant: TenantWithStats) => void;
}

const TenantsTable = ({
  tenants,
  searchQuery,
  onSearchChange,
  onAddTenant,
  onViewDetails,
  onManageSubscription,
  onToggleActive,
  onCreateAdmin,
}: TenantsTableProps) => {
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyTenantUrl = (slug: string) => {
    const url = `${window.location.origin}/auth?tenant=${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Tenant URL copied to clipboard');
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100';
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100';
      case 'basic': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddTenant}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">Tenant</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">No tenants found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        style={{ backgroundColor: tenant.primary_color || '#3B82F6' }}
                      >
                        {tenant.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tenant.employee_count || 0} employees • {tenant.user_count || 0} users
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <code className="text-sm bg-muted px-2 py-0.5 rounded">/{tenant.slug}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyTenantUrl(tenant.slug)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <a 
                        href={`/auth?tenant=${tenant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted"
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTierBadgeColor(tenant.subscription_tier)}>
                      {tenant.subscription_tier.charAt(0).toUpperCase() + tenant.subscription_tier.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-2 h-2 rounded-full ${tenant.is_active ? 'bg-green-500' : 'bg-red-500'}`} 
                      />
                      <span className="text-sm">{tenant.is_active ? 'Active' : 'Suspended'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(tenant.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TenantActionsDropdown
                      tenant={tenant}
                      onViewDetails={onViewDetails}
                      onManageSubscription={onManageSubscription}
                      onToggleActive={onToggleActive}
                      onCreateAdmin={onCreateAdmin}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TenantsTable;
