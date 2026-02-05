import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
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
import ProbationTracker from '@/components/dashboard/ProbationTracker';
import { HRActionsRequired } from '@/components/HRActionsRequired';
import { PendingApprovalsCard } from '@/components/PendingApprovalsCard';
import WorkforceDistribution from '@/components/dashboard/WorkforceDistribution';
import GenderAgeDistribution from '@/components/dashboard/GenderAgeDistribution';
import StatutoryOnboardingModal from '@/components/StatutoryOnboardingModal';

const RoleBasedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, hasRole, loading: profileLoading } = useProfile();
  const { loading: tenantLoading, tenant, refreshTenant } = useTenant();
  const { needsOnboarding, loading: onboardingLoading, markOnboardingComplete } = useOnboardingCheck();
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Get tenant labels at the parent level so they're available when dashboard renders
  const { corporateFeatures, labels, isCorporate } = useTenantLabels();
  
  console.log('RoleBasedDashboard: tenant:', tenant?.slug, 'isCorporate:', isCorporate, 'needsOnboarding:', needsOnboarding);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Auto-retry tenant loading if it fails (up to 3 times)
  useEffect(() => {
    if (!tenantLoading && !tenant && user && retryAttempts < 3) {
      const timer = setTimeout(() => {
        console.log('RoleBasedDashboard: Auto-retrying tenant fetch, attempt:', retryAttempts + 1);
        setRetryAttempts(prev => prev + 1);
        refreshTenant();
      }, 1000); // Wait 1 second before retry
      
      return () => clearTimeout(timer);
    }
  }, [tenantLoading, tenant, user, retryAttempts, refreshTenant]);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    setRetryAttempts(0); // Reset retry counter
    await refreshTenant();
    setIsRetrying(false);
  };

  // Wait for profile, tenant, and onboarding check to load
  if (profileLoading || tenantLoading || onboardingLoading || isRetrying) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If tenant failed to load after all retry attempts, show error with manual retry
  if (!tenant && retryAttempts >= 3) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive font-medium">Organization Not Found</div>
          <p className="text-muted-foreground text-sm max-w-md">
            We couldn't find your organization details. This may happen if your account hasn't been fully set up yet.
            Please contact your administrator or try again.
          </p>
          <Button onClick={handleManualRetry} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Still loading/retrying if tenant is null but we haven't exhausted retries
  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    );
  }

  // Super Admin Dashboard
  const SuperAdminDashboard = () => {
    
    return (
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
              Add {labels.employee}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStatsCards />

        {/* Tasks and Pending Approvals - Corporate only */}
        {isCorporate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskCard />
            </div>
            <div className="lg:col-span-1">
              <PendingApprovalsCard />
            </div>
          </div>
        )}

        {/* Demographics & Workforce Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenderAgeDistribution />
          <WorkforceDistribution />
        </div>

        {/* Corporate-only widgets */}
        {corporateFeatures.probationTracker && (
          <ProbationTracker />
        )}

        {/* HR Actions Required - Corporate only */}
        {isCorporate && (
          <HRActionsRequired />
        )}

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

        {/* Employee Table */}
        <EmployeeTable />

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
  };

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
          <TaskCard title="Pending Approvals" />
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
          <TaskCard title="My Tasks" />
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
    <>
      {/* Statutory Onboarding Modal - shows if user hasn't completed profile */}
      <StatutoryOnboardingModal 
        isOpen={needsOnboarding} 
        onComplete={markOnboardingComplete} 
      />
      
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {getDashboardContent()}
        </div>
      </div>
    </>
  );
};

export default RoleBasedDashboard;
