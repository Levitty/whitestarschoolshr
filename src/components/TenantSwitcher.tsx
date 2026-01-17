import { useTenant } from '@/contexts/TenantContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

const TenantSwitcher = () => {
  const { tenant, tenants, switchTenant, isSaasAdmin } = useTenant();

  // Only show for SaaS admins with multiple tenants
  if (!isSaasAdmin || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={tenant?.id || ''} onValueChange={switchTenant}>
        <SelectTrigger className="w-[200px] h-8 text-sm border-dashed">
          <SelectValue placeholder="Select tenant">
            {tenant?.name || 'Select tenant'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex items-center gap-2">
                {t.logo_url ? (
                  <img
                    src={t.logo_url}
                    alt={t.name}
                    className="h-4 w-4 rounded object-contain"
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{t.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TenantSwitcher;
