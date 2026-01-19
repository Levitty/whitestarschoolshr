import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  RotateCcw,
  Archive,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAssets, CompanyAsset, AssetType, AssetStatus, AssetStats, AssetFilters, AssetAssignment } from '@/hooks/useAssets';
import { useTenant } from '@/contexts/TenantContext';
import AssetAssignmentDialog from './AssetAssignmentDialog';
import AssetReturnDialog from './AssetReturnDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

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

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'phone', label: 'Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'tool', label: 'Tool' },
  { value: 'access_card', label: 'Access Card' },
  { value: 'keys', label: 'Keys' },
  { value: 'other', label: 'Other' },
];

const STATUS_BADGES: Record<AssetStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  available: { label: 'Available', variant: 'default', icon: CheckCircle2 },
  assigned: { label: 'Assigned', variant: 'secondary', icon: UserPlus },
  maintenance: { label: 'Maintenance', variant: 'outline', icon: Clock },
  retired: { label: 'Retired', variant: 'outline', icon: Archive },
  lost: { label: 'Lost', variant: 'destructive', icon: XCircle },
};

const AssetManager = () => {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AssetFilters>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CompanyAsset | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetAssignment[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAsset, setEditAsset] = useState<Partial<CompanyAsset>>({});
  const [newAsset, setNewAsset] = useState({
    asset_type: 'laptop' as AssetType,
    asset_name: '',
    asset_tag: '',
    serial_number: '',
    purchase_value: 0,
    current_value: 0,
    purchase_date: '',
    notes: '',
  });
  
  const { tenant } = useTenant();
  const { 
    loading, 
    fetchAllAssets, 
    getAssetStats, 
    createAsset,
    updateAsset,
    fetchAssetHistory 
  } = useAssets();

  const loadData = async () => {
    setIsLoading(true);
    const [assetsData, statsData] = await Promise.all([
      fetchAllAssets(filters),
      getAssetStats()
    ]);
    setAssets(assetsData);
    setStats(statsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleViewDetails = async (asset: CompanyAsset) => {
    setSelectedAsset(asset);
    const history = await fetchAssetHistory(asset.id);
    setAssetHistory(history);
    setShowDetailDialog(true);
  };

  const handleAddAsset = async () => {
    if (!newAsset.asset_name || !newAsset.asset_tag) return;

    const asset = await createAsset({
      ...newAsset,
      tenant_id: tenant?.id || '',
      status: 'available',
      assigned_to: null,
      assigned_date: null,
      photo_url: null,
      purchase_date: newAsset.purchase_date || null,
      serial_number: newAsset.serial_number || null,
    });

    if (asset) {
      setShowAddDialog(false);
      setNewAsset({
        asset_type: 'laptop',
        asset_name: '',
        asset_tag: '',
        serial_number: '',
        purchase_value: 0,
        current_value: 0,
        purchase_date: '',
        notes: '',
      });
      loadData();
    }
  };

  const generateAssetTag = (type: AssetType) => {
    const prefix = {
      laptop: 'LP',
      phone: 'PH',
      tablet: 'TB',
      uniform: 'UNI',
      vehicle: 'VH',
      tool: 'TL',
      access_card: 'AC',
      keys: 'KY',
      other: 'OT',
    };
    const tenantPrefix = tenant?.slug?.toUpperCase().slice(0, 4) || 'ENDA';
    const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${tenantPrefix}-${prefix[type]}-${num}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.available || 0}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.assigned || 0}</p>
                <p className="text-xs text-muted-foreground">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.maintenance || 0}</p>
                <p className="text-xs text-muted-foreground">In Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Company Assets</CardTitle>
              <CardDescription>Manage and track company assets</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>Add a new company asset to the inventory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Asset Type</Label>
                      <Select 
                        value={newAsset.asset_type} 
                        onValueChange={(v) => {
                          setNewAsset(prev => ({ 
                            ...prev, 
                            asset_type: v as AssetType,
                            asset_tag: generateAssetTag(v as AssetType)
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Asset Tag</Label>
                      <Input 
                        value={newAsset.asset_tag}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, asset_tag: e.target.value }))}
                        placeholder="e.g., ENDA-LP-001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Name</Label>
                    <Input 
                      value={newAsset.asset_name}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, asset_name: e.target.value }))}
                      placeholder="e.g., MacBook Pro 14"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number (Optional)</Label>
                    <Input 
                      value={newAsset.serial_number}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, serial_number: e.target.value }))}
                      placeholder="Serial number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Value (KES)</Label>
                      <Input 
                        type="number"
                        value={newAsset.purchase_value}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_value: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Value (KES)</Label>
                      <Input 
                        type="number"
                        value={newAsset.current_value}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, current_value: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Date (Optional)</Label>
                    <Input 
                      type="date"
                      value={newAsset.purchase_date}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea 
                      value={newAsset.notes}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional notes..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAsset} disabled={loading || !newAsset.asset_name || !newAsset.asset_tag}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Asset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tag or name..."
                className="pl-9"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(v) => setFilters(prev => ({ ...prev, type: v === 'all' ? undefined : v as AssetType }))}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : v as AssetStatus }))}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assets Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h4 className="font-medium text-muted-foreground">No Assets Found</h4>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {Object.keys(filters).length > 0 ? 'Try adjusting your filters' : 'Add your first asset to get started'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const Icon = ASSET_ICONS[asset.asset_type] || Package;
                    const statusInfo = STATUS_BADGES[asset.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(asset)}>
                        <TableCell className="font-mono text-sm font-medium">
                          {asset.asset_tag}
                        </TableCell>
                        <TableCell>{asset.asset_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{asset.asset_type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asset.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={asset.assignee.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {asset.assignee.first_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {asset.assignee.first_name} {asset.assignee.last_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          KES {asset.current_value.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {asset.status === 'available' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(asset);
                                  setShowAssignDialog(true);
                                }}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Assign
                              </Button>
                            )}
                            {asset.status === 'assigned' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(asset);
                                  setShowReturnDialog(true);
                                }}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Return
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(asset); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(asset);
                                  setShowEditDialog(true);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Retire
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>{selectedAsset?.asset_tag}</DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-6">
              {/* Asset Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Asset Name</p>
                  <p className="font-medium">{selectedAsset.asset_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedAsset.asset_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium">{selectedAsset.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={STATUS_BADGES[selectedAsset.status].variant}>
                    {STATUS_BADGES[selectedAsset.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Value</p>
                  <p className="font-medium">KES {selectedAsset.purchase_value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="font-medium">KES {selectedAsset.current_value.toLocaleString()}</p>
                </div>
              </div>

              {selectedAsset.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedAsset.notes}</p>
                </div>
              )}

              {/* Assignment History */}
              <div>
                <h4 className="font-medium mb-3">Assignment History</h4>
                {assetHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignment history</p>
                ) : (
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {assetHistory.map((record) => (
                        <div key={record.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {record.employee?.first_name} {record.employee?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Assigned: {format(new Date(record.assigned_date), 'MMM d, yyyy')}
                              {record.returned_date && (
                                <> • Returned: {format(new Date(record.returned_date), 'MMM d, yyyy')}</>
                              )}
                            </p>
                            {record.condition_on_return && (
                              <Badge variant="outline" className="mt-1 text-xs capitalize">
                                Returned: {record.condition_on_return}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      {selectedAsset && showAssignDialog && (
        <AssetAssignmentDialog
          assetId={selectedAsset.id}
          assetName={selectedAsset.asset_name}
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          onSuccess={() => {
            setShowAssignDialog(false);
            loadData();
          }}
        />
      )}

      {/* Return Dialog */}
      {selectedAsset && showReturnDialog && (
        <AssetReturnDialog
          asset={selectedAsset}
          open={showReturnDialog}
          onOpenChange={setShowReturnDialog}
          onSuccess={() => {
            setShowReturnDialog(false);
            loadData();
          }}
        />
      )}

      {/* Edit Asset Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update asset information</DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input 
                  value={editAsset.asset_name ?? selectedAsset.asset_name}
                  onChange={(e) => setEditAsset(prev => ({ ...prev, asset_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Value (KES)</Label>
                  <Input 
                    type="number"
                    value={editAsset.current_value ?? selectedAsset.current_value}
                    onChange={(e) => setEditAsset(prev => ({ ...prev, current_value: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editAsset.status ?? selectedAsset.status} 
                    onValueChange={(v) => setEditAsset(prev => ({ ...prev, status: v as AssetStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input 
                  value={editAsset.serial_number ?? selectedAsset.serial_number ?? ''}
                  onChange={(e) => setEditAsset(prev => ({ ...prev, serial_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={editAsset.notes ?? selectedAsset.notes ?? ''}
                  onChange={(e) => setEditAsset(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditAsset({});
            }}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (selectedAsset) {
                const success = await updateAsset(selectedAsset.id, editAsset);
                if (success) {
                  setShowEditDialog(false);
                  setEditAsset({});
                  loadData();
                }
              }
            }} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetManager;
