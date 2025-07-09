
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';
import ContractExpiry from '@/components/ContractExpiry';
import { useDocuments } from '@/hooks/useDocuments';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Calendar, 
  Camera,
  AlertTriangle
} from 'lucide-react';

const Records = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const { documents, loading: documentsLoading } = useDocuments();
  const { leaveRequests, loading: leaveLoading } = useLeaveRequests();
  const { user, session, loading: authLoading } = useAuth();

  console.log('Records page - Auth state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    authLoading, 
    documentsCount: documents.length
  });

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

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabsConfig = [
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'upload', label: 'Upload', icon: Camera },
    { value: 'contracts', label: 'Contracts', icon: AlertTriangle },
    { value: 'leave', label: 'Leave Requests', icon: Calendar }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Document Management
        </h1>
        <p className="text-slate-600 mt-2">
          Manage all documents, contracts, and employee records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {tabsConfig.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <DocumentsList />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload onSuccess={() => {
            // Refresh the page or trigger a re-fetch
            window.location.reload();
          }} />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <ContractExpiry />
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading leave requests...</p>
                </div>
              ) : leaveRequests && leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">No leave requests found</p>
                  <p className="text-sm mt-2">Submit a leave request to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaveRequests && leaveRequests.map((request) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;
