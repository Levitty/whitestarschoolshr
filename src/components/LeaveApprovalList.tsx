
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { useProfile } from '@/hooks/useProfile';
import { CheckCircle, XCircle, Clock, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

const LeaveApprovalList = () => {
  const { leaveRequests, loading, approveLeaveRequest, rejectLeaveRequest } = useLeaveRequests();
  const { employees } = useEmployees();
  const { profile } = useProfile();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  
  // Filter states
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-orange-100 text-orange-800';
      case 'maternity':
        return 'bg-pink-100 text-pink-800';
      case 'study':
        return 'bg-purple-100 text-purple-800';
      case 'unpaid':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced filtering logic
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const employee = request.employee_profile || request.profile;
      
      // Leave type filter
      if (leaveTypeFilter !== 'all' && request.leave_type !== leaveTypeFilter) {
        return false;
      }
      
      // Department filter
      if (departmentFilter !== 'all' && employee?.department !== departmentFilter) {
        return false;
      }
      
      // Date range filter
      if (startDateFilter && request.start_date < startDateFilter) {
        return false;
      }
      if (endDateFilter && request.end_date > endDateFilter) {
        return false;
      }
      
      return true;
    });
  }, [leaveRequests, leaveTypeFilter, departmentFilter, startDateFilter, endDateFilter]);

  const handleApprove = async (requestId: string) => {
    if (!profile) return;
    
    setProcessingId(requestId);
    try {
      const result = await approveLeaveRequest(requestId, comments[requestId] || '');
      if (result.error) {
        toast.error('Failed to approve leave request');
      } else {
        toast.success('Leave request approved successfully');
        setComments(prev => ({ ...prev, [requestId]: '' }));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!profile || !comments[requestId]?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(requestId);
    try {
      const result = await rejectLeaveRequest(requestId, comments[requestId]);
      if (result.error) {
        toast.error('Failed to reject leave request');
      } else {
        toast.success('Leave request rejected');
        setComments(prev => ({ ...prev, [requestId]: '' }));
      }
    } finally {
      setProcessingId(null);
    }
  };

  // CSV Export functionality
  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvData = filteredRequests.map(request => {
      const employee = request.employee_profile || request.profile;
      const reviewer = employees.find(emp => emp.id === request.approved_by);
      
      return {
        'Employee Name': employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
        'Department': employee?.department || 'Unknown',
        'Leave Type': request.leave_type,
        'Start Date': request.start_date,
        'End Date': request.end_date,
        'Days Requested': request.days_requested,
        'Status': request.status,
        'Reason': request.reason || '',
        'Reviewed By': reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : '',
        'Decision Date': request.decision_at ? formatDate(request.decision_at) : '',
        'Comments': request.comments || ''
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape quotes and wrap in quotes if contains comma
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leave_requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file downloaded successfully');
  };

  // Get unique values for filters
  const uniqueLeaveTypes = [...new Set(leaveRequests.map(req => req.leave_type))];
  const uniqueDepartments = [...new Set(leaveRequests.map(req => {
    const employee = req.employee_profile || req.profile;
    return employee?.department;
  }).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Leave Request Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Leave Request Approvals ({filteredRequests.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={filteredRequests.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters Section */}
        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Leave Type</Label>
                <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueLeaveTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date From</Label>
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>

              <div>
                <Label>End Date To</Label>
                <Input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLeaveTypeFilter('all');
                  setDepartmentFilter('all');
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => {
              const employee = request.employee_profile || request.profile;
              return (
                <div key={request.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {employee?.department} • {(employee as any)?.position || 'Staff'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getLeaveTypeColor(request.leave_type)}>
                        {request.leave_type}
                      </Badge>
                      <Badge className={getStatusColor(request.status || 'pending')}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Start Date</p>
                      <p>{formatDate(request.start_date)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">End Date</p>
                      <p>{formatDate(request.end_date)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Days</p>
                      <p>{request.days_requested}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Submitted</p>
                      <p>{formatDate(request.created_at || '')}</p>
                    </div>
                  </div>

                  {request.reason && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Reason:</p>
                      <p className="text-sm">{request.reason}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`comments-${request.id}`}>Comments (optional for approval, required for rejection)</Label>
                        <Textarea
                          id={`comments-${request.id}`}
                          placeholder="Add your comments..."
                          value={comments[request.id] || ''}
                          onChange={(e) => setComments(prev => ({
                            ...prev,
                            [request.id]: e.target.value
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processingId === request.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {processingId === request.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {request.status !== 'pending' && request.comments && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Comments:</p>
                      <p className="text-sm">{request.comments}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveApprovalList;
