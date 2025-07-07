
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';
import ContractExpiry from '@/components/ContractExpiry';
import { useDocuments } from '@/hooks/useDocuments';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useProfile } from '@/hooks/useProfile';
import { 
  FileText, 
  Calendar, 
  Download,
  Eye,
  PenTool,
  Camera,
  AlertTriangle
} from 'lucide-react';

const Records = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const { documents, loading: documentsLoading } = useDocuments();
  const { leaveRequests, loading: leaveLoading } = useLeaveRequests();
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

  // Different tab configurations for admin vs regular users
  const getTabsConfig = () => {
    if (isAdmin) {
      return [
        { value: 'documents', label: 'Documents', icon: FileText },
        { value: 'upload', label: 'Upload', icon: Camera },
        { value: 'contracts', label: 'Contracts', icon: AlertTriangle },
        { value: 'leave', label: 'Leave Requests', icon: Calendar }
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isAdmin ? 'Document Management' : 'My Records'}
        </h1>
        <p className="text-slate-600 mt-2">
          {isAdmin 
            ? 'Manage all documents, contracts, and employee records'
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
          <DocumentsList />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload onSuccess={() => window.location.reload()} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="contracts" className="space-y-6">
            <ContractExpiry />
          </TabsContent>
        )}

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAdmin ? 'All Leave Requests' : 'My Leave Requests'}</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveLoading ? (
                <div className="text-center py-8">Loading leave requests...</div>
              ) : leaveRequests && leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No leave requests found.</p>
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
