
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DocumentUpload from '@/components/DocumentUpload';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import InterviewForm from '@/components/InterviewForm';
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
  PenTool
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
      pending: 'default',
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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Records Management</h1>
        <p className="text-slate-600 mt-2">
          Manage documents, leave requests, and interview records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Leave Requests
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Interviews
            </TabsTrigger>
          )}
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No documents found. Upload your first document to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-slate-600">{doc.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {doc.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          {getStatusBadge(doc.status || 'draft')}
                          <span className="text-xs text-slate-500">
                            {formatDate(doc.created_at || '')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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

        <TabsContent value="leave" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaveRequestForm />
            <Card>
              <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveLoading ? (
                  <div className="text-center py-8">Loading leave requests...</div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No leave requests found.
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
                      No interviews scheduled.
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
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentUpload />
            {isAdmin && <InterviewForm />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;
