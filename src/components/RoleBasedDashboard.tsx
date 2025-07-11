
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Users, Calendar, Briefcase, ListChecks, BarChart, GraduationCap, FileText, Settings, UserPlus, FolderOpen, MessageSquare } from 'lucide-react';
import HRAnalyticsCards from '@/components/HRAnalyticsCards';
import RoleGuard from '@/components/RoleGuard';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Super Admin Dashboard
  const SuperAdminDashboard = () => (
    <div className="space-y-6">
      {/* HR Analytics Cards - Only for Super Admins */}
      <HRAnalyticsCards />

      {/* All Quick Actions for Super Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/employees')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Employee Management</h3>
                <p className="text-sm text-slate-600">Manage employee profiles and records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/leave')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Leave Management</h3>
                <p className="text-sm text-slate-600">Handle leave requests and balances</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/recruitment')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Recruitment</h3>
                <p className="text-sm text-slate-600">Manage job postings and applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/applications')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Applications</h3>
                <p className="text-sm text-slate-600">View and manage job applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/performance')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <BarChart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Performance Management</h3>
                <p className="text-sm text-slate-600">Track and analyze employee performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/upskilling')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Upskilling & Training</h3>
                <p className="text-sm text-slate-600">Manage employee training and development</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/records')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Records & Documents</h3>
                <p className="text-sm text-slate-600">Access employee records and documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Support Tickets</h3>
                <p className="text-sm text-slate-600">Address employee concerns and issues</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/employees')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">My Team</h3>
                <p className="text-sm text-slate-600">Manage your team members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/leave')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Leave Approvals</h3>
                <p className="text-sm text-slate-600">Review and approve leave requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/performance')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <BarChart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Team Performance</h3>
                <p className="text-sm text-slate-600">Monitor team performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/upskilling')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Team Training</h3>
                <p className="text-sm text-slate-600">Manage team training programs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/records')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Team Documents</h3>
                <p className="text-sm text-slate-600">Access team documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Support</h3>
                <p className="text-sm text-slate-600">Handle support requests</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/leave')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">My Leave</h3>
                <p className="text-sm text-slate-600">Request and manage your leave</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/performance')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <BarChart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">My Performance</h3>
                <p className="text-sm text-slate-600">View your performance records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/upskilling')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">My Training</h3>
                <p className="text-sm text-slate-600">Access your training programs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/records')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">My Documents</h3>
                <p className="text-sm text-slate-600">Access your personal documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => navigate('/tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Support</h3>
                <p className="text-sm text-slate-600">Get help and support</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            Welcome to Your Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            {profile
              ? `Hello, ${profile.first_name} ${profile.last_name}! Here's your personalized dashboard.`
              : 'Loading user information...'}
          </p>
        </div>

        {/* Role-based Dashboard Content */}
        {getDashboardContent()}
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
