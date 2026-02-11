import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { CheckCircle, Download, Filter, Calendar, XCircle, Paperclip, Eye, FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovedLeavesListProps {
  statusFilter?: 'approved' | 'rejected' | 'all';
}

const ApprovedLeavesList = ({ statusFilter = 'all' }: ApprovedLeavesListProps) => {
  const { leaveRequests, loading } = useLeaveRequests();
  const { employees } = useEmployees();
  
  // Filter states
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [localStatusFilter, setLocalStatusFilter] = useState<string>(statusFilter);

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
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'sick':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'maternity':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'study':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'unpaid':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Filter requests to show only approved/rejected
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const employee = request.employee_profile || request.profile;
      const workflowStage = (request as any).workflow_stage || 'pending_head';
      
      // Filter by status (approved/rejected)
      if (localStatusFilter === 'approved' && workflowStage !== 'approved') return false;
      if (localStatusFilter === 'rejected' && workflowStage !== 'rejected') return false;
      if (localStatusFilter === 'all' && workflowStage !== 'approved' && workflowStage !== 'rejected') return false;
      
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
  }, [leaveRequests, leaveTypeFilter, departmentFilter, startDateFilter, endDateFilter, localStatusFilter]);

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
        'Days Taken': request.days_requested,
        'Status': request.status,
        'Approved/Rejected By': reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : '',
        'Decision Date': request.decision_at ? formatDate(request.decision_at) : '',
        'Comments': request.comments || ''
      };
    });

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leave_records_${new Date().toISOString().split('T')[0]}.csv`);
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
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle className="h-5 w-5" />
            Leave Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle className="h-5 w-5" />
            Leave Records ({filteredRequests.length})
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
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label className="text-foreground">Status</Label>
                <Select value={localStatusFilter} onValueChange={setLocalStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Completed</SelectItem>
                    <SelectItem value="approved">Approved Only</SelectItem>
                    <SelectItem value="rejected">Rejected Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground">Leave Type</Label>
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
                <Label className="text-foreground">Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground">From Date</Label>
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-foreground">To Date</Label>
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
                  setLocalStatusFilter('all');
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
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leave records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const employee = request.employee_profile || request.profile;
              const workflowStage = (request as any).workflow_stage || 'pending_head';
              
              return (
                <div key={request.id} className="border rounded-lg p-4 space-y-3 bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
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
                      <Badge className={getStatusColor(workflowStage)}>
                        {workflowStage === 'approved' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Approved</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Rejected</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Start Date</p>
                      <p className="text-foreground">{formatDate(request.start_date)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">End Date</p>
                      <p className="text-foreground">{formatDate(request.end_date)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Days</p>
                      <p className="text-foreground">{request.days_requested}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Decision Date</p>
                      <p className="text-foreground">{request.decision_at ? formatDate(request.decision_at) : '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Submitted</p>
                      <p className="text-foreground">{formatDate(request.created_at || '')}</p>
                    </div>
                  </div>

                  {request.comments && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Comments:</p>
                      <p className="text-sm text-foreground">{request.comments}</p>
                    </div>
                  )}

                  {/* Proof/Evidence attachment */}
                  {(request as any).proof_url && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg">
                      <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {(request as any).proof_file_name || 'Proof Document'}
                        </p>
                        <p className="text-xs text-muted-foreground">Evidence attached</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open((request as any).proof_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={(request as any).proof_url} download={(request as any).proof_file_name || 'proof'} target="_blank" rel="noopener noreferrer">
                            <FileDown className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
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

export default ApprovedLeavesList;
