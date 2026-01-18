import { Navigate } from 'react-router-dom';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import ClearanceDashboard from '@/components/ClearanceDashboard';

const Clearances = () => {
  const { isCorporate } = useTenantLabels();

  // Only show for corporate tenants
  if (!isCorporate) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Offboarding Clearances</h1>
        <p className="text-muted-foreground">
          Track and manage employee offboarding, clearances, and final settlements.
        </p>
      </div>
      <ClearanceDashboard />
    </div>
  );
};

export default Clearances;
