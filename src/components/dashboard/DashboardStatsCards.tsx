import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import DashboardStatsCard from './DashboardStatsCard';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departments: number;
}

const DashboardStatsCards = () => {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?.id) {
      fetchStats();
    }
  }, [tenant?.id]);

  const fetchStats = async () => {
    if (!tenant?.id) return;
    
    try {
      const { data: employees, error: empError } = await supabase
        .from('employee_profiles')
        .select('status')
        .eq('tenant_id', tenant.id);

      if (empError) throw empError;

      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('tenant_id', tenant.id);

      if (deptError) throw deptError;

      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
      const inactiveEmployees = employees?.filter(e => e.status === 'inactive').length || 0;

      setStats({
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departments: departments?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[140px] bg-card animate-pulse rounded-xl shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <DashboardStatsCard
        title="Total Employees"
        value={stats.totalEmployees}
        icon={Users}
        accentColor="blue"
        trend={{ value: 12, label: 'compared to last month' }}
      />
      <DashboardStatsCard
        title="Active Employees"
        value={stats.activeEmployees}
        icon={UserCheck}
        accentColor="emerald"
        trend={{ value: 8, label: 'compared to last month' }}
      />
      <DashboardStatsCard
        title="On Leave / Inactive"
        value={stats.inactiveEmployees}
        icon={UserX}
        accentColor="amber"
        trend={{ value: -3, label: 'compared to last month' }}
      />
      <DashboardStatsCard
        title="Departments"
        value={stats.departments}
        icon={Building2}
        accentColor="violet"
      />
    </div>
  );
};

export default DashboardStatsCards;
