
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
import { CheckCircle, XCircle, Clock, Download, Filter, ArrowRight, AlertCircle, Eye, EyeOff, Trash2, Paperclip, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenantLabels } from '@/hooks/useTenantLabels';

interface LeaveApprovalListProps {
  mode?: 'head' | 'hr';
}

const LeaveApprovalList = ({ mode = 'head' }: LeaveApprovalListProps) => {
  const { leaveRequests, loading, approveLeaveRequest, rejectLeaveRequest, forwardToHR, deleteLeaveRequest } = useLeaveRequests();
  const { employees } = useEmployees();
  const { profile, hasRole } = useProfile();
  const { isCorporate, labels } = useTenantLabels();
  const headLabel = isCorporate ? 'Department Head' : 'Head Teacher';
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  
  // Filter states
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Determine if user is HR/Admin/SuperAdmin
  const isHR = hasRole('admin') || hasRole('superadmin');
  const isHead = hasRole('head');
  const effectiveMode = isHR ? 'hr' : 'head';

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case 'pending_head':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending_hr':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkflowStageLabel = (stage: string) => {
    switch (stage) {
      case 'pending_head':
        return 'Pending Head Review';
      case 'pending_hr':
        return 'Pending HR Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return stage || 'Pending';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'recommend_approve':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'recommend_reject':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'recommend_approve':
        return 'Recommends Approval';
      case 'recommend_reject':
        return 'Recommends Rejection';
      case 'neutral':
        return 'Neutral';
      default:
        return '';
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

  // Filter requests based on workflow stage and user role
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const employee = request.employee_profile || request.profile;
      const workflowStage = (request as any).workflow_stage || 'pending_head';
      
      // HR/Admin/SuperAdmin can see ALL pending requests in both tabs
      // Mode just changes the default view but admins see everything
      if (isHR) {
        // Admins see all pending requests regardless of stage
        // Only filter out already processed requests (approved/rejected)
        if (mode === 'head') {
          // In Head Review tab: show pending_head AND pending_hr for admins
          if (workflowStage !== 'pending_head' && workflowStage !== 'pending_hr') return false;
        } else if (mode === 'hr') {
          // In HR Approval tab: show all pending requests for admins
          if (workflowStage !== 'pending_head' && workflowStage !== 'pending_hr') return false;
        }
      } else if (isHead) {
        // Head teachers only see pending_head requests
        if (workflowStage !== 'pending_head') return false;
      } else {
        // Regular staff shouldn't see approval lists
        return false;
      }
      
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
  }, [leaveRequests, leaveTypeFilter, departmentFilter, startDateFilter, endDateFilter, mode, isHR, isHead]);

  // Head teacher forwards to HR
  const handleForwardToHR = async (requestId: string) => {
    if (!profile) return;
    
    const recommendation = recommendations[requestId];
    if (!recommendation) {
      toast.error('Please select a recommendation');
      return;
    }
    
    setProcessingId(requestId);
    try {
      const result = await forwardToHR(
        requestId,
        recommendation as 'recommend_approve' | 'recommend_reject' | 'neutral',
        internalNotes[requestId] || ''
      );
      if (result.error) {
        toast.error('Failed to forward request to HR');
      } else {
        toast.success('Request forwarded to HR for final approval');
        setInternalNotes(prev => ({ ...prev, [requestId]: '' }));
        setRecommendations(prev => ({ ...prev, [requestId]: '' }));
      }
    } finally {
      setProcessingId(null);
    }
  };

  // HR approves
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

  // HR rejects
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
        'Workflow Stage': (request as any).workflow_stage || 'pending_head',
        'Reason': request.reason || '',
        'Reviewed By': reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : '',
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
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5" />
            {effectiveMode === 'hr' ? 'HR Leave Approvals' : 'Leave Request Review'}
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
            <Clock className="h-5 w-5" />
            {effectiveMode === 'hr' ? 'HR Leave Approvals' : 'Leave Request Review'} ({filteredRequests.length})
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label className="text-foreground">Start Date From</Label>
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-foreground">End Date To</Label>
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
            <p className="text-muted-foreground">
              {effectiveMode === 'hr' 
                ? 'No requests pending HR approval' 
                : 'No requests pending your review'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => {
              const employee = request.employee_profile || request.profile;
              const workflowStage = (request as any).workflow_stage || 'pending_head';
              const headRecommendation = (request as any).head_recommendation;
              const headInternalNotes = (request as any).head_internal_notes;
              
              return (
                <div key={request.id} className="border rounded-lg p-6 space-y-4 bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {employee 
                          ? (employee.first_name || employee.last_name 
                              ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() 
                              : employee.email || 'Unknown Employee')
                          : 'Unknown Employee'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {employee?.department} • {(employee as any)?.position || 'Staff'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Badge className={getLeaveTypeColor(request.leave_type)}>
                        {request.leave_type}
                      </Badge>
                      <Badge className={getWorkflowStageColor(workflowStage)}>
                        {getWorkflowStageLabel(workflowStage)}
                      </Badge>
                      {isHR && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this leave request? This action cannot be undone.')) {
                              setProcessingId(request.id);
                              const result = await deleteLeaveRequest(request.id);
                              setProcessingId(null);
                              if (result.error) {
                                toast.error('Failed to delete leave request');
                              } else {
                                toast.success('Leave request deleted successfully');
                              }
                            }
                          }}
                          disabled={processingId === request.id}
                          title="Delete leave request"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                      <p className="font-medium text-muted-foreground">Submitted</p>
                      <p className="text-foreground">{formatDate(request.created_at || '')}</p>
                    </div>
                  </div>

                  {request.reason && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Reason:</p>
                      <p className="text-sm text-foreground">{request.reason}</p>
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
                          onClick={async () => {
                            const raw = (request as any).proof_url as string;
                            // Handle old full-URL format and new relative path format
                            const filePath = raw.includes('/leave-proofs/') 
                              ? raw.split('/leave-proofs/').pop()! 
                              : raw;
                            const { data, error } = await supabase.storage
                              .from('leave-proofs')
                              .createSignedUrl(filePath, 3600);
                            if (error || !data?.signedUrl) {
                              toast.error('Failed to load proof document');
                              return;
                            }
                            window.open(data.signedUrl, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const raw = (request as any).proof_url as string;
                            const filePath = raw.includes('/leave-proofs/') 
                              ? raw.split('/leave-proofs/').pop()! 
                              : raw;
                            const { data, error } = await supabase.storage
                              .from('leave-proofs')
                              .download(filePath);
                            if (error || !data) {
                              toast.error('Failed to download proof document');
                              return;
                            }
                            const url = URL.createObjectURL(data);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = (request as any).proof_file_name || 'proof';
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* HR can see Head's recommendation and internal notes */}
                  {effectiveMode === 'hr' && workflowStage === 'pending_hr' && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                          {headLabel}'s Review (Internal - Not visible to employee)
                        </span>
                      </div>
                      
                      {headRecommendation && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Recommendation:</span>
                          <Badge className={getRecommendationColor(headRecommendation)}>
                            {getRecommendationLabel(headRecommendation)}
                          </Badge>
                        </div>
                      )}
                      
                      {headInternalNotes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Internal Notes:</p>
                          <p className="text-sm text-foreground bg-white dark:bg-gray-800 p-2 rounded border">
                            {headInternalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Head Teacher Review Section */}
                  {effectiveMode === 'head' && !isHR && workflowStage === 'pending_head' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm text-amber-800 dark:text-amber-300">
                            <strong>As Head of Department:</strong> Review this request and send your recommendation to HR for final approval
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`internal-notes-${request.id}`} className="text-foreground">
                          Internal Notes for HR (Optional - Not visible to employee)
                        </Label>
                        <Textarea
                          id={`internal-notes-${request.id}`}
                          placeholder="Add any notes for HR (e.g., workload considerations, team availability)..."
                          value={internalNotes[request.id] || ''}
                          onChange={(e) => setInternalNotes(prev => ({
                            ...prev,
                            [request.id]: e.target.value
                          }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <EyeOff className="h-3 w-3" />
                          These notes are confidential and will not be shown to the employee
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => {
                            setRecommendations(prev => ({ ...prev, [request.id]: 'recommend_approve' }));
                            setTimeout(() => handleForwardToHR(request.id), 100);
                          }}
                          disabled={processingId === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processingId === request.id && recommendations[request.id] === 'recommend_approve' 
                            ? 'Sending...' 
                            : 'Recommend Approve'}
                        </Button>
                        <Button
                          onClick={() => {
                            setRecommendations(prev => ({ ...prev, [request.id]: 'recommend_reject' }));
                            setTimeout(() => handleForwardToHR(request.id), 100);
                          }}
                          disabled={processingId === request.id}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {processingId === request.id && recommendations[request.id] === 'recommend_reject' 
                            ? 'Sending...' 
                            : 'Recommend Reject'}
                        </Button>
                        <Button
                          onClick={() => {
                            setRecommendations(prev => ({ ...prev, [request.id]: 'neutral' }));
                            setTimeout(() => handleForwardToHR(request.id), 100);
                          }}
                          disabled={processingId === request.id}
                          variant="outline"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          {processingId === request.id && recommendations[request.id] === 'neutral' 
                            ? 'Sending...' 
                            : 'Forward (Neutral)'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your recommendation will be sent to HR for final approval. Only HR can approve or reject the leave request.
                      </p>
                    </div>
                  )}

                  {/* HR Approval Section */}
                  {effectiveMode === 'hr' && workflowStage === 'pending_hr' && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <Label htmlFor={`comments-${request.id}`} className="text-foreground">
                          Public Comments (Visible to employee)
                        </Label>
                        <Textarea
                          id={`comments-${request.id}`}
                          placeholder="Add comments for the employee..."
                          value={comments[request.id] || ''}
                          onChange={(e) => setComments(prev => ({
                            ...prev,
                            [request.id]: e.target.value
                          }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          This comment will be visible to the employee
                        </p>
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

                  {/* Show final comments for completed requests */}
                  {(workflowStage === 'approved' || workflowStage === 'rejected') && request.comments && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Final Comments:</p>
                      <p className="text-sm text-foreground">{request.comments}</p>
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
