
import { Users, BookOpen, TrendingUp, Clock } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const recentActivities = [
    { id: 1, action: 'New employee onboarded', user: 'Sarah Johnson', time: '2 hours ago' },
    { id: 2, action: 'Course completed', user: 'Mike Chen', course: 'Leadership Skills', time: '4 hours ago' },
    { id: 3, action: 'Performance review submitted', user: 'Alex Rodriguez', time: '1 day ago' },
    { id: 4, action: 'Training request approved', user: 'Emily Davis', time: '2 days ago' },
  ];

  const upcomingCourses = [
    { id: 1, title: 'Project Management Fundamentals', startDate: '2024-06-20', participants: 15 },
    { id: 2, title: 'Data Analytics for HR', startDate: '2024-06-25', participants: 8 },
    { id: 3, title: 'Effective Communication', startDate: '2024-07-01', participants: 22 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening in your organization.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Users className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value="248"
          icon={<Users className="h-8 w-8" />}
          trend={{ value: "+12 this month", isPositive: true }}
        />
        <StatsCard
          title="Active Courses"
          value="18"
          icon={<BookOpen className="h-8 w-8" />}
          trend={{ value: "+3 new", isPositive: true }}
        />
        <StatsCard
          title="Completion Rate"
          value="87%"
          icon={<TrendingUp className="h-8 w-8" />}
          trend={{ value: "+5%", isPositive: true }}
        />
        <StatsCard
          title="Avg. Training Hours"
          value="42"
          icon={<Clock className="h-8 w-8" />}
          trend={{ value: "per employee", isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-sm text-slate-600">
                      {activity.user}
                      {activity.course && <span className="text-blue-600"> - {activity.course}</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingCourses.map((course) => (
                <div key={course.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <h4 className="font-medium text-slate-900">{course.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-600">Starts: {course.startDate}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {course.participants} enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
