
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
      setExpiringContracts(contracts.slice(0, 3));
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
      performance: (4.8 - index * 0.2).toFixed(1),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Welcome back! Here's what's happening in your organization.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                Top Performing Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-white">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{performer.name}</p>
                        <p className="text-sm text-slate-600">{performer.position} • {performer.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          {performer.performance}/5.0
                        </Badge>
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
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 hover:from-gray-50 hover:to-slate-50 transition-all duration-200 border border-slate-100">
                    <div className={`w-3 h-3 rounded-full mt-2 shadow-sm ${
                      activity.type === 'employee' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                      activity.type === 'document' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                      'bg-gradient-to-r from-orange-400 to-red-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{activity.action}</p>
                      <p className="text-slate-600">{activity.user}</p>
                      <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview and Contract Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Department Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDepartments.map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-100">
                    <span className="font-medium text-slate-900">{dept}</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                        {count} employees
                      </div>
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
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
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                Contract Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringContracts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm">No contracts expiring soon</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringContracts.map((contract) => (
                    <div key={contract.employee_id} className="flex items-center justify-between p-4 border-l-4 border-gradient-to-b from-orange-400 to-red-400 bg-gradient-to-r from-orange-50 to-red-50 rounded-r-xl">
                      <div>
                        <p className="font-medium text-slate-900">{contract.employee_name}</p>
                        <p className="text-sm text-slate-600">
                          Expires in {contract.days_until_expiry} days
                        </p>
                      </div>
                      <Badge className={`${contract.days_until_expiry <= 7 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white border-0 shadow-sm`}>
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
    </div>
  );
};

export default Dashboard;
