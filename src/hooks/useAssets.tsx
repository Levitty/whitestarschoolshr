import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

export type AssetType = 'laptop' | 'phone' | 'tablet' | 'uniform' | 'vehicle' | 'tool' | 'access_card' | 'keys' | 'other';
export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
export type ConditionOnAssign = 'new' | 'excellent' | 'good' | 'fair' | 'poor';
export type ConditionOnReturn = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | 'lost';

export interface CompanyAsset {
  id: string;
  tenant_id: string;
  asset_type: AssetType;
  asset_name: string;
  asset_tag: string;
  serial_number: string | null;
  purchase_value: number;
  current_value: number;
  purchase_date: string | null;
  status: AssetStatus;
  assigned_to: string | null;
  assigned_date: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

export interface AssetAssignment {
  id: string;
  asset_id: string;
  employee_id: string;
  tenant_id: string;
  assigned_date: string;
  returned_date: string | null;
  condition_on_assign: ConditionOnAssign;
  condition_on_return: ConditionOnReturn | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  employee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export interface AssetFilters {
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  assignedTo?: string;
}

export interface AssetStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  retired: number;
  lost: number;
  byType: Record<AssetType, number>;
}

export const useAssets = () => {
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchAllAssets = async (filters?: AssetFilters): Promise<CompanyAsset[]> => {
    try {
      setLoading(true);
      let query = supabase
        .from('company_assets')
        .select(`
          *,
          assignee:profiles!company_assets_assigned_to_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('asset_type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.search) {
        query = query.or(`asset_tag.ilike.%${filters.search}%,asset_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as CompanyAsset[]) || [];
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAssets = async (employeeId: string): Promise<CompanyAsset[]> => {
    try {
      const { data, error } = await supabase
        .from('company_assets')
        .select('*')
        .eq('assigned_to', employeeId)
        .eq('status', 'assigned')
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      return (data as unknown as CompanyAsset[]) || [];
    } catch (error: any) {
      console.error('Error fetching employee assets:', error);
      return [];
    }
  };

  const fetchAssetHistory = async (assetId: string): Promise<AssetAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('asset_assignments')
        .select(`
          *,
          employee:profiles!asset_assignments_employee_id_fkey(id, first_name, last_name, email)
        `)
        .eq('asset_id', assetId)
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      return (data as unknown as AssetAssignment[]) || [];
    } catch (error: any) {
      console.error('Error fetching asset history:', error);
      return [];
    }
  };

  const createAsset = async (data: Omit<CompanyAsset, 'id' | 'created_at' | 'updated_at' | 'assignee'>): Promise<CompanyAsset | null> => {
    try {
      setLoading(true);
      const { data: asset, error } = await supabase
        .from('company_assets')
        .insert({
          ...data,
          tenant_id: tenant?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Asset Created',
        description: `Asset ${data.asset_tag} has been added.`,
      });

      return asset as unknown as CompanyAsset;
    } catch (error: any) {
      console.error('Error creating asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create asset.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async (id: string, data: Partial<CompanyAsset>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('company_assets')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Asset Updated',
        description: 'Asset details have been updated.',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to update asset.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignAsset = async (
    assetId: string, 
    employeeId: string, 
    condition: ConditionOnAssign = 'good',
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const today = new Date().toISOString().split('T')[0];

      // Update asset
      const { error: assetError } = await supabase
        .from('company_assets')
        .update({
          status: 'assigned',
          assigned_to: employeeId,
          assigned_date: today
        })
        .eq('id', assetId);

      if (assetError) throw assetError;

      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .insert({
          asset_id: assetId,
          employee_id: employeeId,
          tenant_id: tenant?.id,
          assigned_date: today,
          condition_on_assign: condition,
          notes,
          created_by: user?.id
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: 'Asset Assigned',
        description: 'Asset has been assigned to the employee.',
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign asset.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const returnAsset = async (
    assetId: string,
    condition: ConditionOnReturn,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Determine new status based on condition
      let newStatus: AssetStatus = 'available';
      if (condition === 'damaged') newStatus = 'maintenance';
      if (condition === 'lost') newStatus = 'lost';

      // Update asset
      const { error: assetError } = await supabase
        .from('company_assets')
        .update({
          status: newStatus,
          assigned_to: null,
          assigned_date: null
        })
        .eq('id', assetId);

      if (assetError) throw assetError;

      // Update the current assignment record
      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .update({
          returned_date: today,
          condition_on_return: condition,
          notes: notes
        })
        .eq('asset_id', assetId)
        .is('returned_date', null);

      if (assignmentError) throw assignmentError;

      toast({
        title: 'Asset Returned',
        description: condition === 'lost' 
          ? 'Asset marked as lost.' 
          : condition === 'damaged' 
            ? 'Asset sent to maintenance.' 
            : 'Asset returned successfully.',
      });

      return true;
    } catch (error: any) {
      console.error('Error returning asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to return asset.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAssetStats = async (): Promise<AssetStats> => {
    try {
      const { data, error } = await supabase
        .from('company_assets')
        .select('status, asset_type');

      if (error) throw error;

      const stats: AssetStats = {
        total: data?.length || 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        retired: 0,
        lost: 0,
        byType: {
          laptop: 0,
          phone: 0,
          tablet: 0,
          uniform: 0,
          vehicle: 0,
          tool: 0,
          access_card: 0,
          keys: 0,
          other: 0
        }
      };

      data?.forEach(asset => {
        if (asset.status in stats) {
          stats[asset.status as keyof Omit<AssetStats, 'total' | 'byType'>]++;
        }
        if (asset.asset_type in stats.byType) {
          stats.byType[asset.asset_type as AssetType]++;
        }
      });

      return stats;
    } catch (error: any) {
      console.error('Error getting asset stats:', error);
      return {
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        retired: 0,
        lost: 0,
        byType: {
          laptop: 0,
          phone: 0,
          tablet: 0,
          uniform: 0,
          vehicle: 0,
          tool: 0,
          access_card: 0,
          keys: 0,
          other: 0
        }
      };
    }
  };

  return {
    loading,
    fetchAllAssets,
    fetchEmployeeAssets,
    fetchAssetHistory,
    createAsset,
    updateAsset,
    assignAsset,
    returnAsset,
    getAssetStats,
  };
};
