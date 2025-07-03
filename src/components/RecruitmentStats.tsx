
import { Users, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Employee {
  hire_date: string;
  department: string;
}

interface RecruitmentStatsProps {
  employees: Employee[];
}

const RecruitmentStats = ({ employees }: RecruitmentStatsProps) => {
  const getRecruitmentStats = () => {
    const totalEmployees = employees.length;
    const newHires = employees.filter(emp => {
      const hireDate = new Date(emp.hire_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return hireDate >= thirtyDaysAgo;
    }).length;

    const departments = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalEmployees, newHires, departments };
  };

  const stats = getRecruitmentStats();

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Recruitment Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Hires (30 days)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newHires}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.departments).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.departments).map(([department, count]) => (
              <div key={department} className="flex items-center justify-between">
                <span className="text-sm font-medium">{department}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitmentStats;
