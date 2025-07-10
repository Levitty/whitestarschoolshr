
import { useNavigate } from 'react-router-dom';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import MyLeaveRequests from '@/components/MyLeaveRequests';

const LeaveForm = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Refresh the page or navigate back to show updated data
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leave Request</h1>
          <p className="text-slate-600 mt-1">Submit your leave requests and track their status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeaveRequestForm onSuccess={handleSuccess} />
          <MyLeaveRequests />
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
