
import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Clock, Award, AlertTriangle, Calendar, FileText } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useDocuments } from '@/hooks/useDocuments';

const Dashboard = () => {
  const { employees, getExpiringContracts } = useEmployees();
  const { documents } = useDocuments();
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);

  useEffect(() => {
    const fetchExpiringContracts = async () => {
      const contracts = await getExpiringContracts();
      setExpiringContracts(contracts.slice(0, 3)); // Show only top 3
    };
    fetchExpiringContracts();
  }, []);

  // Calculate stats from real data
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalDocuments = documents.length;
  const recentDocuments = documents.filter(doc => {
    const docDate = new Date(doc.created_at || '');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return docDate >= weekAgo;
  }).length;

  // Mock performance data based on actual employees
  const topPerformers = employees
    .filter(emp => emp.status === 'active')
    .slice(0, 5)
    .map((emp, index) => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department,
      position: emp.position,
      performance: (4.8 - index * 0.2).toFixed(1), // Mock decreasing performance scores
      completedTasks: Math.floor(Math.random() * 20) + 15,
      onTimeRate: Math.floor(Math.random() * 15) + 85
    }));

  const recentActivities = [
    ...employees.slice(0, 2).map(emp => ({
      id: `emp-${emp.id}`,
      action: 'New employee onboarded',
      user: `${emp.first_name} ${emp.last_name}`,
      time: '2 hours ago',
      type: 'employee'
    })),
    ...documents.slice(0, 2).map(doc => ({
      id: `doc-${doc.id}`,
      action: 'Document uploaded',
      user: doc.title,
      time: '4 hours ago',
      type: 'document'
    })),
    {
      id: 'contract-1',
      action: 'Contract expiring soon',
      user: expiringContracts[0]?.employee_name || 'John Doe',
      time: '1 day ago',
      type: 'contract'
    }
  ];

  const departmentStats = employees.reduce((acc, emp) => {
    if (emp.status === 'active') {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topDepartments = Object.entries(departmentStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4);

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
            View All Employees
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Employees"
          value={activeEmployees.toString()}
          icon={<Users className="h-8 w-8" />}
          trend={{ value: `+${Math.floor(activeEmployees * 0.05)} this month`, isPositive: true }}
        />
        <StatsCard
          title="Total Documents"
          value={totalDocuments.toString()}
          icon={<FileText className="h-8 w-8" />}
          trend={{ value: `+${recentDocuments} this week`, isPositive: true }}
        />
        <StatsCard
          title="Contract Expiring"
          value={expiringContracts.length.toString()}
          icon={<AlertTriangle className="h-8 w-8" />}
          trend={{ value: "Next 90 days", isPositive: false }}
        />
        <StatsCard
          title="Departments"
          value={Object.keys(departmentStats).length.toString()}
          icon={<Award className="h-8 w-8" />}
          trend={{ value: `${topDepartments[0]?.[0] || 'N/A'} largest`, isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{performer.name}</p>
                      <p className="text-xs text-slate-600">{performer.position} • {performer.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{performer.performance}/5.0</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {performer.completedTasks} tasks • {performer.onTimeRate}% on-time
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'employee' ? 'bg-green-500' :
                    activity.type === 'document' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-sm text-slate-600">{activity.user}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview and Contract Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDepartments.map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 px-2 py-1 rounded text-xs font-medium text-blue-700">
                      {count} employees
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / activeEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Contract Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringContracts.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No contracts expiring soon</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringContracts.map((contract) => (
                  <div key={contract.employee_id} className="flex items-center justify-between p-3 border-l-4 border-orange-400 bg-orange-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{contract.employee_name}</p>
                      <p className="text-xs text-slate-600">
                        Expires in {contract.days_until_expiry} days
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {contract.days_until_expiry <= 7 ? 'Critical' : 'Soon'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
