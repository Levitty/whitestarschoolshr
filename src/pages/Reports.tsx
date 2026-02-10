import ProtectedRoute from '@/components/ProtectedRoute';
import ManagementReportsDashboard from '@/components/ManagementReportsDashboard';

const Reports = () => {
  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <ManagementReportsDashboard />
      </div>
    </ProtectedRoute>
  );
};

export default Reports;
