
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useJobListings } from '@/hooks/useJobListings';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useInterviews } from '@/hooks/useInterviews';

export const RecruitmentReports = () => {
  const { jobListings } = useJobListings();
  const { applications } = useJobApplications();
  const { interviews } = useInterviews();

  // Prepare data for charts
  const jobApplicationsData = jobListings?.map(job => ({
    jobTitle: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
    applications: applications?.filter(app => app.job_id === job.id).length || 0
  })) || [];

  const statusData = [
    { name: 'New', value: applications?.filter(app => app.status === 'New').length || 0, color: '#8884d8' },
    { name: 'Interview', value: applications?.filter(app => app.status === 'Interview').length || 0, color: '#82ca9d' },
    { name: 'Rejected', value: applications?.filter(app => app.status === 'Rejected').length || 0, color: '#ffc658' },
    { name: 'Hired', value: applications?.filter(app => app.status === 'Hired').length || 0, color: '#ff7300' }
  ];

  const interviewData = [
    { name: 'Scheduled', value: interviews?.filter(int => int.status === 'Scheduled').length || 0 },
    { name: 'Completed', value: interviews?.filter(int => int.status === 'Completed').length || 0 }
  ];

  const departmentData = jobListings?.reduce((acc, job) => {
    const existing = acc.find(item => item.department === job.department);
    if (existing) {
      existing.applications += applications?.filter(app => app.job_id === job.id).length || 0;
    } else {
      acc.push({
        department: job.department,
        applications: applications?.filter(app => app.job_id === job.id).length || 0
      });
    }
    return acc;
  }, [] as { department: string; applications: number }[]) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Recruitment Reports & Analytics</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{jobListings?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Job Postings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{applications?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{interviews?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Interviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {applications?.filter(app => app.status === 'Hired').length || 0}
              </p>
              <p className="text-sm text-gray-600">Successful Hires</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications per Job */}
        <Card>
          <CardHeader>
            <CardTitle>Applications per Job</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobApplicationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jobTitle" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department-wise Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interview Status */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviewData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-2xl font-bold text-blue-600">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
