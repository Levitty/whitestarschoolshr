
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Calendar
} from 'lucide-react';

const DocumentsList = () => {
  const { documents, loading } = useDocuments();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

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

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please sign in to view documents</p>
        </CardContent>
      </Card>
    );
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryLabel(doc.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Library
          {filteredDocuments.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </Badge>
          )}
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
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            {documents.length === 0 ? (
              <>
                <p className="font-medium">No documents found</p>
                <p className="text-sm mt-2">Upload documents to get started</p>
              </>
            ) : (
              <>
                <p className="font-medium">No matching documents</p>
                <p className="text-sm mt-2">Try adjusting your search terms</p>
              </>
            )}
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
                      <span>{getCategoryLabel(doc.category)}</span>
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
