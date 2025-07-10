import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Users, Calendar, Briefcase, ListChecks, BarChart, GraduationCap, FileText } from 'lucide-react';

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
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to Your Dashboard</h1>
        <p className="text-slate-600 mt-2">
          {profile
            ? `Hello, ${profile.first_name} ${profile.last_name}! Here's a quick overview of your HR tools.`
            : 'Loading user information...'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/employees')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Employee Management</h3>
                <p className="text-sm text-muted-foreground">Manage employee profiles and records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/leave')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Leave Management</h3>
                <p className="text-sm text-muted-foreground">Handle leave requests and balances</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasRole('manager') && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/leave/calendar')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Leave Calendar</h3>
                  <p className="text-sm text-muted-foreground">View approved leaves in calendar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/recruitment')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Recruitment</h3>
                <p className="text-sm text-muted-foreground">Manage job postings and applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ListChecks className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Tickets</h3>
                <p className="text-sm text-muted-foreground">Address employee concerns and issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/performance')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <BarChart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Performance</h3>
                <p className="text-sm text-muted-foreground">Track and analyze employee performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/upskilling')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">Upskilling</h3>
                <p className="text-sm text-muted-foreground">Manage employee training and development</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/records')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold">Records</h3>
                <p className="text-sm text-muted-foreground">Access employee records and documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information or Analytics Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">System Overview</h2>
        <p className="text-slate-600">
          This dashboard provides a centralized view of your HR management activities. Use the quick actions above to
          navigate to specific areas of the system.
        </p>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
