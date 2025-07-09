
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobListings } from '@/hooks/useJobListings';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useInterviews } from '@/hooks/useInterviews';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const RecruitmentReports = () => {
  const { jobListings } = useJobListings();
  const { applications } = useJobApplications();
  const { interviews } = useInterviews();

  // Calculate application stats by status
  const statusData = [
    { name: 'New', value: applications?.filter(app => app.status === 'New').length || 0 },
    { name: 'Interview', value: applications?.filter(app => app.status === 'Interview').length || 0 },
    { name: 'Rejected', value: applications?.filter(app => app.status === 'Rejected').length || 0 },
    { name: 'Hired', value: applications?.filter(app => app.status === 'Hired').length || 0 }
  ];

  // Calculate applications per job
  const jobApplicationData = jobListings?.map(job => ({
    name: job.title,
    applications: applications?.filter(app => app.job_id === job.id).length || 0
  })).slice(0, 5) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Recruitment Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications per Job (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobApplicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {jobListings?.filter(job => job.status === 'Open').length || 0}
              </div>
              <div className="text-sm text-gray-600">Active Job Postings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {applications?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {interviews?.filter(interview => interview.status === 'Scheduled').length || 0}
              </div>
              <div className="text-sm text-gray-600">Scheduled Interviews</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
