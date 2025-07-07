
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CameraUpload from '@/components/CameraUpload';
import DocumentTemplateManager from '@/components/DocumentTemplateManager';
import RecruitmentAssessments from '@/components/RecruitmentAssessments';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import InterviewForm from '@/components/InterviewForm';
import DocumentUpload from '@/components/DocumentUpload';
import ContractExpiry from '@/components/ContractExpiry';
import { useDocuments } from '@/hooks/useDocuments';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useInterviews } from '@/hooks/useInterviews';
import { useProfile } from '@/hooks/useProfile';
import { 
  FileText, 
  Calendar, 
  UserCheck, 
  Download,
  Eye,
  PenTool,
  Camera,
  Users,
  AlertTriangle
} from 'lucide-react';

const Records = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const { documents, loading: documentsLoading } = useDocuments();
  const { leaveRequests, loading: leaveLoading } = useLeaveRequests();
  const { interviews, loading: interviewsLoading } = useInterviews();
  const { profile } = useProfile();

  const isAdmin = profile?.role === 'admin';

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      draft: 'secondary',
      signed: 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    // TODO: Implement document download functionality
    console.log('Download document:', filePath, fileName);
  };

  const viewDocument = async (filePath: string) => {
    // TODO: Implement document view functionality
    console.log('View document:', filePath);
  };

  // Different tab configurations for admin vs regular users
  const getTabsConfig = () => {
    if (isAdmin) {
      return [
        { value: 'documents', label: 'Documents', icon: FileText },
        { value: 'upload', label: 'Upload', icon: Camera },
        { value: 'contracts', label: 'Contracts', icon: AlertTriangle },
        { value: 'templates', label: 'Templates', icon: FileText },
        { value: 'recruitment', label: 'Recruitment', icon: Users },
        { value: 'leave', label: 'Leave Requests', icon: Calendar },
        { value: 'interviews', label: 'Interviews', icon: UserCheck }
      ];
    } else {
      return [
        { value: 'documents', label: 'My Documents', icon: FileText },
        { value: 'upload', label: 'Upload', icon: Camera },
        { value: 'leave', label: 'Leave Requests', icon: Calendar }
      ];
    }
  };

  const tabsConfig = getTabsConfig();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isAdmin ? 'Document Management' : 'My Records'}
        </h1>
        <p className="text-slate-600 mt-2">
          {isAdmin 
            ? 'Manage all documents, templates, contracts, and employee records'
            : 'Access your documents, submit leave requests, and upload files'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabsConfig.length}, 1fr)` }}>
          {tabsConfig.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAdmin ? 'All Documents' : 'My Documents'}</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No documents found.</p>
                  <p className="text-sm mt-2">Upload your first document to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-slate-600">{doc.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {doc.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          {getStatusBadge(doc.status || 'draft')}
                          <span className="text-xs text-slate-500">
                            {formatDate(doc.created_at || '')}
                          </span>
                          {doc.is_system_generated && (
                            <Badge variant="secondary">System Generated</Badge>
                          )}
                          {doc.file_name && (
                            <span className="text-xs text-slate-500">
                              {doc.file_name} ({doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewDocument(doc.file_path || '')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadDocument(doc.file_path || '', doc.file_name || '')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {doc.requires_signature && (
                          <Button variant="outline" size="sm">
                            <PenTool className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload onSuccess={() => window.location.reload()} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="contracts" className="space-y-6">
            <ContractExpiry />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="templates" className="space-y-6">
            <DocumentTemplateManager />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="recruitment" className="space-y-6">
            <RecruitmentAssessments />
          </TabsContent>
        )}

        <TabsContent value="leave" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaveRequestForm />
            <Card>
              <CardHeader>
                <CardTitle>{isAdmin ? 'All Leave Requests' : 'My Leave Requests'}</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveLoading ? (
                  <div className="text-center py-8">Loading leave requests...</div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>No leave requests found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} Leave
                          </h3>
                          {getStatusBadge(request.status || 'pending')}
                        </div>
                        <p className="text-sm text-slate-600">
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {request.days_requested} days
                        </p>
                        {request.reason && (
                          <p className="text-sm text-slate-500 mt-2">{request.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="interviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InterviewForm />
              <Card>
                <CardHeader>
                  <CardTitle>Interview Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {interviewsLoading ? (
                    <div className="text-center py-8">Loading interviews...</div>
                  ) : interviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-4" />
                      <p>No interviews scheduled.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {interviews.map((interview) => (
                        <div key={interview.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{interview.candidate_name}</h3>
                            {getStatusBadge(interview.status || 'scheduled')}
                          </div>
                          <p className="text-sm text-slate-600">{interview.position}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(interview.interview_date).toLocaleString()}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {interview.interview_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Records;
