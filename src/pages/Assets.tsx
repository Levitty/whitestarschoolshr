import { Navigate } from 'react-router-dom';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import AssetManager from '@/components/AssetManager';

const Assets = () => {
  const { isCorporate } = useTenantLabels();

  // Only show for corporate tenants
  if (!isCorporate) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Asset Management</h1>
        <p className="text-muted-foreground">
          Manage and track company assets, assignments, and inventory.
        </p>
      </div>
      <AssetManager />
    </div>
  );
};

export default Assets;
