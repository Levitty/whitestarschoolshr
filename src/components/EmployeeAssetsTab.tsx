import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Shirt, 
  Car, 
  Wrench, 
  CreditCard, 
  Key,
  Plus,
  Calendar
} from 'lucide-react';
import { useAssets, CompanyAsset, AssetType } from '@/hooks/useAssets';
import AssetAssignmentDialog from './AssetAssignmentDialog';
import { useAuth } from '@/hooks/useAuth';

interface EmployeeAssetsTabProps {
  employeeId: string;
  profileId?: string | null;
  employeeName: string;
}

const ASSET_ICONS: Record<AssetType, any> = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
  uniform: Shirt,
  vehicle: Car,
  tool: Wrench,
  access_card: CreditCard,
  keys: Key,
  other: Package,
};

const ASSET_COLORS: Record<AssetType, string> = {
  laptop: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  phone: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  tablet: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  uniform: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  vehicle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  tool: 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
  access_card: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  keys: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

const EmployeeAssetsTab = ({ employeeId, profileId, employeeName }: EmployeeAssetsTabProps) => {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<CompanyAsset[]>([]);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<CompanyAsset | null>(null);
  const { fetchEmployeeAssets, fetchAllAssets } = useAssets();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin' || profile?.role === 'head';

  const loadAssets = async () => {
    setIsLoading(true);
    // Assets are assigned using profiles.id (auth user id), but this component
    // may receive employee_profiles.id. Try both: profile_id first (matches assignment),
    // then fall back to employeeId for backward compatibility.
    let data = profileId ? await fetchEmployeeAssets(profileId) : [];
    if (data.length === 0 && employeeId !== profileId) {
      data = await fetchEmployeeAssets(employeeId);
    }
    setAssets(data);
    setIsLoading(false);
  };

  const loadAvailableAssets = async () => {
    const data = await fetchAllAssets({ status: 'available' });
    setAvailableAssets(data);
  };

  useEffect(() => {
    loadAssets();
    if (isAdmin) {
      loadAvailableAssets();
    }
  }, [employeeId]);

  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.current_value), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assigned Assets</h3>
          <p className="text-sm text-muted-foreground">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} • Total Value: KES {totalValue.toLocaleString()}
          </p>
        </div>
        {isAdmin && availableAssets.length > 0 && (
          <Button onClick={() => setShowAssignDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Assign Asset
          </Button>
        )}
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h4 className="font-medium text-muted-foreground">No Assets Assigned</h4>
            <p className="text-sm text-muted-foreground/70 mt-1">
              This employee doesn't have any company assets assigned.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const Icon = ASSET_ICONS[asset.asset_type] || Package;
            const colorClass = ASSET_COLORS[asset.asset_type] || ASSET_COLORS.other;

            return (
              <Card key={asset.id} className="overflow-hidden">
                <div className={`h-2 ${colorClass.split(' ')[0]}`} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{asset.asset_name}</p>
                      <p className="text-xs text-muted-foreground">{asset.asset_tag}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-semibold">KES {asset.current_value.toLocaleString()}</span>
                    </div>
                    
                    {asset.assigned_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Assigned {new Date(asset.assigned_date).toLocaleDateString()}
                      </div>
                    )}

                    <Badge variant="secondary" className="text-xs capitalize">
                      {asset.asset_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Assign Dialog - shows available assets */}
      {showAssignDialog && availableAssets.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Asset to Assign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {availableAssets.map((asset) => {
                const Icon = ASSET_ICONS[asset.asset_type] || Package;
                return (
                  <Button
                    key={asset.id}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => {
                      setSelectedAssetForAssign(asset);
                      setShowAssignDialog(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">{asset.asset_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.asset_tag} • KES {asset.current_value.toLocaleString()}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-3"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      {selectedAssetForAssign && (
        <AssetAssignmentDialog
          assetId={selectedAssetForAssign.id}
          assetName={selectedAssetForAssign.asset_name}
          open={!!selectedAssetForAssign}
          onOpenChange={(open) => !open && setSelectedAssetForAssign(null)}
          onSuccess={() => {
            setSelectedAssetForAssign(null);
            loadAssets();
            loadAvailableAssets();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeAssetsTab;
