
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDocuments } from '@/hooks/useDocuments';
import { useEmployees } from '@/hooks/useEmployees';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  User,
  Calendar,
  Filter
} from 'lucide-react';

interface DocumentsListProps {
  employeeId?: string;
}

const DocumentsList = ({ employeeId }: DocumentsListProps) => {
  const { documents, loading } = useDocuments();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');

  const getEmployeeName = (empId: string | null) => {
    if (!empId) return 'Unassigned';
    const employee = employees.find(emp => emp.id === empId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      pending_review: { variant: 'secondary' as const, label: 'Pending Review' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      signed: { variant: 'default' as const, label: 'Signed' },
      archived: { variant: 'secondary' as const, label: 'Archived' }
    };

    const config = variants[status as keyof typeof variants] || { 
      variant: 'secondary' as const, 
      label: status 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      employment_records: 'Employment Records',
      disciplinary_records: 'Disciplinary Records',
      performance_records: 'Performance Records',
      leave_requests: 'Leave Requests',
      interview_records: 'Interview Records',
      shared_documents: 'Shared Documents'
    };
    
    return labels[category as keyof typeof labels] || category;
  };

  // Filter documents by employee if employeeId is provided
  const employeeFilteredDocuments = employeeId 
    ? documents.filter(doc => doc.employee_id === employeeId)
    : documents;

  const filteredDocuments = employeeFilteredDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryLabel(doc.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEmployeeName(doc.employee_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {employeeId ? 'Employee Documents' : 'Document Library'}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>No documents found</p>
            <p className="text-sm mt-2">
              {employeeId ? 'No documents uploaded for this employee' : 'Upload documents to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{doc.title}</h4>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        {getCategoryLabel(doc.category)}
                      </span>
                      {!employeeId && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getEmployeeName(doc.employee_id)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.created_at || '').toLocaleDateString()}
                      </span>
                      {doc.file_size && (
                        <span>
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusBadge(doc.status || 'draft')}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsList;
