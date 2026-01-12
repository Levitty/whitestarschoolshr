import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, Briefcase, BarChart, GraduationCap, 
  FolderOpen, MessageSquare, UserPlus, Download, FileText 
} from 'lucide-react';
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards';
import NewHiresChart from '@/components/dashboard/NewHiresChart';
import EmployeeTable from '@/components/dashboard/EmployeeTable';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import TaskCard from '@/components/dashboard/TaskCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import HeadDashboardSummary from '@/components/HeadDashboardSummary';
import StaffDashboardSummary from '@/components/StaffDashboardSummary';

const RoleBasedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, hasRole, loading } = useProfile();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Super Admin Dashboard
  const SuperAdminDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader 
        firstName={profile?.first_name}
        lastName={profile?.last_name}
        avatarUrl={profile?.avatar_url}
        role={profile?.role}
      />

      {/* Page Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and manage your workforce at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 shadow-sm border-0 bg-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 shadow-sm" onClick={() => navigate('/employees')}>
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <NewHiresChart />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Tasks and Employee Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TaskCard />
        </div>
        <div className="lg:col-span-2">
          <EmployeeTable />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Leave Management"
            description="Review and approve requests"
            icon={Calendar}
            accentColor="emerald"
            onClick={() => navigate('/leave')}
          />
          <QuickActionCard
            title="Recruitment"
            description="Manage job postings"
            icon={UserPlus}
            accentColor="orange"
            onClick={() => navigate('/recruitment')}
          />
          <QuickActionCard
            title="Performance"
            description="Track evaluations"
            icon={BarChart}
            accentColor="amber"
            onClick={() => navigate('/performance')}
          />
          <QuickActionCard
            title="Documents"
            description="Access all records"
            icon={FolderOpen}
            accentColor="teal"
            onClick={() => navigate('/records')}
          />
        </div>
      </div>
    </div>
  );

  // Head Dashboard
  const HeadDashboard = () => (
    <div className="space-y-6">
      <WelcomeHeader 
        firstName={profile?.first_name}
        lastName={profile?.last_name}
        avatarUrl={profile?.avatar_url}
        role={profile?.role}
      />
      
      <div>
        <h2 className="text-xl font-semibold text-foreground">Team Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your team and track their progress
        </p>
      </div>
      
      <HeadDashboardSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskCard 
            title="Pending Approvals"
            tasks={[
              { id: '1', title: 'Review Sarah\'s leave request', status: 'pending', time: '1d' },
              { id: '2', title: 'Complete John\'s evaluation', status: 'in_progress', time: '2d' },
              { id: '3', title: 'Approve training budget', status: 'pending', time: '3d' },
              { id: '4', title: 'Review weekly reports', status: 'completed', time: '1h' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="My Team"
            description="View team members"
            icon={Users}
            accentColor="blue"
            onClick={() => navigate('/employees')}
          />
          <QuickActionCard
            title="Leave Approvals"
            description="Review requests"
            icon={Calendar}
            accentColor="emerald"
            onClick={() => navigate('/leave')}
          />
          <QuickActionCard
            title="Team Performance"
            description="Monitor evaluations"
            icon={BarChart}
            accentColor="amber"
            onClick={() => navigate('/performance')}
          />
          <QuickActionCard
            title="Team Training"
            description="Manage development"
            icon={GraduationCap}
            accentColor="indigo"
            onClick={() => navigate('/upskilling')}
          />
          <QuickActionCard
            title="Team Documents"
            description="Access files"
            icon={FolderOpen}
            accentColor="teal"
            onClick={() => navigate('/records')}
          />
          <QuickActionCard
            title="Support Tickets"
            description="Handle requests"
            icon={MessageSquare}
            accentColor="rose"
            onClick={() => navigate('/tickets')}
          />
        </div>
      </div>
    </div>
  );

  // Teacher/Staff Dashboard
  const TeacherStaffDashboard = () => (
    <div className="space-y-6">
      <WelcomeHeader 
        firstName={profile?.first_name}
        lastName={profile?.last_name}
        avatarUrl={profile?.avatar_url}
        role={profile?.role}
      />
      
      <div>
        <h2 className="text-xl font-semibold text-foreground">My Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Access your personal information and requests
        </p>
      </div>
      
      <StaffDashboardSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskCard 
            title="My Tasks"
            tasks={[
              { id: '1', title: 'Complete self-evaluation', status: 'in_progress', time: '2d' },
              { id: '2', title: 'Submit weekly report', status: 'pending', time: '1d' },
              { id: '3', title: 'Update profile information', status: 'completed', time: '30m' },
              { id: '4', title: 'Complete training module', status: 'in_progress', time: '5h' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="My Leave"
            description="Request time off"
            icon={Calendar}
            accentColor="emerald"
            onClick={() => navigate('/leave')}
          />
          <QuickActionCard
            title="My Performance"
            description="View evaluations"
            icon={BarChart}
            accentColor="amber"
            onClick={() => navigate('/performance')}
          />
          <QuickActionCard
            title="My Training"
            description="Access courses"
            icon={GraduationCap}
            accentColor="indigo"
            onClick={() => navigate('/upskilling')}
          />
          <QuickActionCard
            title="My Documents"
            description="View your files"
            icon={FolderOpen}
            accentColor="teal"
            onClick={() => navigate('/records')}
          />
          <QuickActionCard
            title="Get Support"
            description="Submit a ticket"
            icon={MessageSquare}
            accentColor="rose"
            onClick={() => navigate('/tickets')}
          />
        </div>
      </div>
    </div>
  );

  const getDashboardContent = () => {
    const userRole = profile?.role;
    
    switch (userRole) {
      case 'superadmin':
      case 'admin':
        return <SuperAdminDashboard />;
      case 'head':
        return <HeadDashboard />;
      case 'teacher':
      case 'staff':
      default:
        return <TeacherStaffDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {getDashboardContent()}
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
