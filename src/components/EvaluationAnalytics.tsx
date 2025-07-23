
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEvaluations } from '@/hooks/useEvaluations';
import { TrendingUp, Users, Star, Award } from 'lucide-react';

const EvaluationAnalytics = () => {
  const { getEvaluationAnalytics } = useEvaluations();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await getEvaluationAnalytics();
      if (data) {
        setAnalytics(data);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const overallStats = analytics.length > 0 ? {
    avgAcademic: analytics.reduce((sum, dept) => sum + dept.academic_avg, 0) / analytics.length,
    avgCulture: analytics.reduce((sum, dept) => sum + dept.culture_avg, 0) / analytics.length,
    avgDevelopment: analytics.reduce((sum, dept) => sum + dept.development_avg, 0) / analytics.length,
    avgCustomer: analytics.reduce((sum, dept) => sum + dept.customer_avg, 0) / analytics.length,
    avgOverall: analytics.reduce((sum, dept) => sum + dept.overall_avg, 0) / analytics.length
  } : null;

  const pieData = overallStats ? [
    { name: 'Academic Achievement', value: overallStats.avgAcademic, color: '#0088FE' },
    { name: 'School Culture', value: overallStats.avgCulture, color: '#00C49F' },
    { name: 'Professional Development', value: overallStats.avgDevelopment, color: '#FFBB28' },
    { name: 'Customer Relationship', value: overallStats.avgCustomer, color: '#FF8042' }
  ] : [];

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Academic Achievement</p>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.avgAcademic.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">School Culture</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.avgCulture.toFixed(1)}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Professional Development</p>
                  <p className="text-2xl font-bold text-purple-600">{overallStats.avgDevelopment.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customer Relationship</p>
                  <p className="text-2xl font-bold text-orange-600">{overallStats.avgCustomer.toFixed(1)}</p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis domain={[0, 5]} />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2), '']}
                  labelFormatter={(label) => `Department: ${label}`}
                />
                <Bar dataKey="academic_avg" fill="#0088FE" name="Academic" />
                <Bar dataKey="culture_avg" fill="#00C49F" name="Culture" />
                <Bar dataKey="development_avg" fill="#FFBB28" name="Development" />
                <Bar dataKey="customer_avg" fill="#FF8042" name="Customer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toFixed(2), 'Average Score']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Department</th>
                  <th className="border border-gray-300 p-2 text-center">Academic</th>
                  <th className="border border-gray-300 p-2 text-center">Culture</th>
                  <th className="border border-gray-300 p-2 text-center">Development</th>
                  <th className="border border-gray-300 p-2 text-center">Customer</th>
                  <th className="border border-gray-300 p-2 text-center">Overall</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">{dept.department}</td>
                    <td className="border border-gray-300 p-2 text-center">{dept.academic_avg.toFixed(1)}</td>
                    <td className="border border-gray-300 p-2 text-center">{dept.culture_avg.toFixed(1)}</td>
                    <td className="border border-gray-300 p-2 text-center">{dept.development_avg.toFixed(1)}</td>
                    <td className="border border-gray-300 p-2 text-center">{dept.customer_avg.toFixed(1)}</td>
                    <td className="border border-gray-300 p-2 text-center font-bold">{dept.overall_avg.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationAnalytics;
