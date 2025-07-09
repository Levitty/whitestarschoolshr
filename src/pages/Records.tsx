
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';
import ContractExpiry from '@/components/ContractExpiry';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Camera,
  AlertTriangle
} from 'lucide-react';

const Records = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const tabsConfig = [
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'upload', label: 'Upload', icon: Camera },
    { value: 'contracts', label: 'Contracts', icon: AlertTriangle }
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
        <TabsList className="grid w-full grid-cols-3">
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
            setActiveTab('documents');
          }} />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <ContractExpiry />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;
