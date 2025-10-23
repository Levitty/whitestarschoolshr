import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDocuments } from '@/hooks/useDocuments';
import { useEmployees } from '@/hooks/useEmployees';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DocumentViewerDialog from '@/components/DocumentViewerDialog';
import { Database } from '@/integrations/supabase/types';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Calendar,
  Trash2,
  Filter,
  Users,
  Grid,
  List
} from 'lucide-react';

type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface DocumentsListProps {
  employeeId?: string;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ employeeId }) => {
  const { documents, loading, fetchDocuments } = useDocuments();
  const { employees, loading: employeesLoading } = useEmployees();
  const { canAccessSuperAdmin } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      pending_review: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      signed: 'default',
      archived: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  const handleDelete = async (documentId: string, filePath: string | null) => {
    if (!canAccessSuperAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete documents.",
        variant: "destructive"
      });
      return;
    }

    setDeleting(documentId);
    try {
      // Delete the file from storage if it exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('employee-documents')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Document deleted successfully."
        });
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (filePath: string | null) => {
    if (!filePath) return;
    const { data } = await supabase.storage
      .from('employee-documents')
      .createSignedUrl(filePath, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };
 
  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please sign in to view documents</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get employee name from document
  const getEmployeeName = (doc: any) => {
    if (doc.employee_profile) {
      return `${doc.employee_profile.first_name} ${doc.employee_profile.last_name}`;
    } else if (doc.profile) {
      return `${doc.profile.first_name} ${doc.profile.last_name}`;
    }
    return 'Unknown Employee';
  };

  // Helper function to get employee for filtering
  const getEmployeeForFilter = (doc: any) => {
    return doc.employee_profile || doc.profile || null;
  };

  const filteredDocuments = documents.filter(doc => {
    // Cast to any to access enriched properties
    const enrichedDoc = doc as any;
    
    // Text search
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(doc.category).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Employee filter by dropdown - now using employee_number as primary identifier
    let matchesEmployee = selectedEmployee === 'all';
    if (selectedEmployee !== 'all') {
      // Find the selected employee from the employees list to get employee_number
      const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
      
      // Match by employee_number (primary) or fallback to employee_id
      matchesEmployee = (
        (enrichedDoc.employee_number && enrichedDoc.employee_number === selectedEmp?.employee_number) || // Primary: match by employee_number
        doc.employee_id === selectedEmployee || // Fallback: direct match with employee_profile.id
        (selectedEmp?.profile_id && doc.employee_id === selectedEmp.profile_id) || // Fallback: match with profile_id
        (enrichedDoc.employee_profile?.id === selectedEmployee) || // Fallback: enriched employee_profile match
        (enrichedDoc.profile?.id === selectedEmp?.profile_id) // Fallback: enriched profile match
      );
    }
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    
    // Filter by specific employee if employeeId is provided (from props)
    let matchesEmployeeId = !employeeId;
    if (employeeId && !matchesEmployeeId) {
      // Check multiple possible matches for the employee
      matchesEmployeeId = (
        doc.employee_id === employeeId || // Direct match with employee_id
        enrichedDoc.employee_profile?.id === employeeId || // Match with enriched employee_profile
        enrichedDoc.profile?.id === employeeId || // Match with enriched profile
        (employees.find(emp => emp.id === employeeId)?.profile_id && 
         doc.employee_id === employees.find(emp => emp.id === employeeId)?.profile_id) // Match via profile_id
      );
    }
    
    return matchesSearch && matchesEmployee && matchesCategory && matchesStatus && matchesEmployeeId;
  });

  const categories = [
    { value: 'employment_records', label: 'Employment Records' },
    { value: 'disciplinary_records', label: 'Disciplinary Records' },
    { value: 'performance_records', label: 'Performance Records' },
    { value: 'leave_requests', label: 'Leave Requests' },
    { value: 'interview_records', label: 'Interview Records' },
    { value: 'shared_documents', label: 'Shared Documents' }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'signed', label: 'Signed' },
    { value: 'archived', label: 'Archived' }
  ];

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-slate-600">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCardsView = () => (
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
                <span>{getCategoryLabel(doc.category)}</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {getEmployeeName(doc)}
                </span>
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
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload(doc.file_path)}>
                <Download className="h-4 w-4" />
              </Button>
              {canAccessSuperAdmin() && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(doc.id, doc.file_path)}
                  disabled={deleting === doc.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deleting === doc.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{doc.title}</p>
                  {doc.description && (
                    <p className="text-sm text-gray-500">{doc.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>{getCategoryLabel(doc.category)}</TableCell>
              <TableCell>{getEmployeeName(doc)}</TableCell>
              <TableCell>{getStatusBadge(doc.status || 'draft')}</TableCell>
              <TableCell>{new Date(doc.created_at || '').toLocaleDateString()}</TableCell>
              <TableCell>
                {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc.file_path)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {canAccessSuperAdmin() && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.file_path)}
                      disabled={deleting === doc.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleting === doc.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
            {filteredDocuments.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Trigger search on Enter key
                    setSearchTerm(searchTerm);
                  }
                }}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                // Clear all filters
                setSearchTerm('');
                setSelectedEmployee('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="shrink-0"
            >
              Clear Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            {documents.length === 0 ? (
              <>
                <p className="font-medium">No documents found</p>
                <p className="text-sm mt-2">Upload documents to get started</p>
              </>
            ) : (
              <>
                <p className="font-medium">No matching documents</p>
                <p className="text-sm mt-2">Try adjusting your search and filter settings</p>
              </>
            )}
          </div>
        ) : (
          viewMode === 'cards' ? renderCardsView() : renderTableView()
        )}
      </CardContent>
    </Card>

    <DocumentViewerDialog
      open={!!previewDoc}
      onOpenChange={(open) => {
        if (!open) setPreviewDoc(null);
      }}
      document={previewDoc}
    />
    </>
  );
};
 
export default DocumentsList;
