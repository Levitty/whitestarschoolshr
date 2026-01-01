import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardStatsCard from './DashboardStatsCard';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departments: number;
}

const DashboardStatsCards = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch employee counts
      const { data: employees, error: empError } = await supabase
        .from('employee_profiles')
        .select('status');

      if (empError) throw empError;

      // Fetch departments count
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id');

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatsCard
        title="Total Employees"
        value={stats.totalEmployees}
        icon={Users}
      />
      <DashboardStatsCard
        title="Active Employees"
        value={stats.activeEmployees}
        icon={UserCheck}
      />
      <DashboardStatsCard
        title="Inactive Employees"
        value={stats.inactiveEmployees}
        icon={UserX}
      />
      <DashboardStatsCard
        title="Departments"
        value={stats.departments}
        icon={Building2}
      />
    </div>
  );
};

export default DashboardStatsCards;
