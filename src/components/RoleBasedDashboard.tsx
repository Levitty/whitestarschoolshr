import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Briefcase, BarChart, GraduationCap, FolderOpen, MessageSquare, UserPlus, Download } from 'lucide-react';
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards';
import NewHiresChart from '@/components/dashboard/NewHiresChart';
import EmployeeTable from '@/components/dashboard/EmployeeTable';
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

  // Super Admin Dashboard - New Modern Design
  const SuperAdminDashboard = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and monitor your workforce
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate('/employees')}>
            <UserPlus className="h-4 w-4" />
            New Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards />

      {/* Chart Section */}
      <NewHiresChart />

      {/* Employee Table */}
      <EmployeeTable />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/leave')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100/80 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Leave Management</h3>
                <p className="text-xs text-muted-foreground">Handle leave requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/recruitment')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100/80 rounded-lg group-hover:bg-orange-200 transition-colors">
                <UserPlus className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Recruitment</h3>
                <p className="text-xs text-muted-foreground">Manage job postings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/performance')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100/80 rounded-lg group-hover:bg-amber-200 transition-colors">
                <BarChart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Performance</h3>
                <p className="text-xs text-muted-foreground">Track evaluations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/records')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100/80 rounded-lg group-hover:bg-teal-200 transition-colors">
                <FolderOpen className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Documents</h3>
                <p className="text-xs text-muted-foreground">Access records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Head Dashboard
  const HeadDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your team and track their progress
        </p>
      </div>
      
      <HeadDashboardSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/employees')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100/80 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">My Team</h3>
                <p className="text-xs text-muted-foreground">View team members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/leave')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100/80 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Leave Approvals</h3>
                <p className="text-xs text-muted-foreground">Review requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/performance')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100/80 rounded-lg group-hover:bg-amber-200 transition-colors">
                <BarChart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Team Performance</h3>
                <p className="text-xs text-muted-foreground">Monitor evaluations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/upskilling')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100/80 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Team Training</h3>
                <p className="text-xs text-muted-foreground">Manage development</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/records')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100/80 rounded-lg group-hover:bg-teal-200 transition-colors">
                <FolderOpen className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Team Documents</h3>
                <p className="text-xs text-muted-foreground">Access files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/tickets')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100/80 rounded-lg group-hover:bg-rose-200 transition-colors">
                <MessageSquare className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Support</h3>
                <p className="text-xs text-muted-foreground">Handle requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Teacher/Staff Dashboard
  const TeacherStaffDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Access your personal information and requests
        </p>
      </div>
      
      <StaffDashboardSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/leave')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100/80 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">My Leave</h3>
                <p className="text-xs text-muted-foreground">Request time off</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/performance')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100/80 rounded-lg group-hover:bg-amber-200 transition-colors">
                <BarChart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">My Performance</h3>
                <p className="text-xs text-muted-foreground">View evaluations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/upskilling')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100/80 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">My Training</h3>
                <p className="text-xs text-muted-foreground">Access courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/records')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100/80 rounded-lg group-hover:bg-teal-200 transition-colors">
                <FolderOpen className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">My Documents</h3>
                <p className="text-xs text-muted-foreground">View your files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          variant="glass"
          className="hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group" 
          onClick={() => navigate('/tickets')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100/80 rounded-lg group-hover:bg-rose-200 transition-colors">
                <MessageSquare className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Support</h3>
                <p className="text-xs text-muted-foreground">Get help</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {profile
                ? `Welcome back, ${profile.first_name}!`
                : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        {getDashboardContent()}
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
