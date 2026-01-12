
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';
import ContractExpiry from '@/components/ContractExpiry';
import DocumentTemplateManager from '@/components/DocumentTemplateManager';
import LetterWriter from '@/components/LetterWriter';
import LetterheadSettings from '@/components/LetterheadSettings';
import EmployeeLetterArchive from '@/components/EmployeeLetterArchive';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Camera,
  AlertTriangle,
  PenTool,
  Sparkles,
  Building,
  Archive
} from 'lucide-react';

const Records = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const { user, loading: authLoading, profile } = useAuth();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access documents.</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';
  const tabsConfig = isAdmin ? [
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'upload', label: 'Upload', icon: Camera },
    { value: 'templates', label: 'Letter Templates', icon: PenTool },
    { value: 'write-letter', label: 'Write Letter', icon: Sparkles },
    { value: 'letterhead', label: 'Letterhead', icon: Building },
    { value: 'letter-archive', label: 'Letter Archive', icon: Archive },
    { value: 'contracts', label: 'Contracts', icon: AlertTriangle }
  ] : [
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'upload', label: 'Upload', icon: Camera }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Document Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage all documents, contracts, templates, and employee records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
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
          }} employeeId={isAdmin ? undefined : user.id} />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="templates" className="space-y-6">
              <DocumentTemplateManager />
            </TabsContent>

            <TabsContent value="write-letter" className="space-y-6">
              <LetterWriter />
            </TabsContent>

            <TabsContent value="letterhead" className="space-y-6">
              <LetterheadSettings />
            </TabsContent>

            <TabsContent value="letter-archive" className="space-y-6">
              <EmployeeLetterArchive />
            </TabsContent>

            <TabsContent value="contracts" className="space-y-6">
              <ContractExpiry />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Records;
