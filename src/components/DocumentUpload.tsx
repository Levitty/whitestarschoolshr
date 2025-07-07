
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/useDocuments';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { Upload, FileText } from 'lucide-react';

interface DocumentUploadProps {
  onSuccess?: () => void;
  preselectedEmployeeId?: string;
}

const DocumentUpload = ({ onSuccess, preselectedEmployeeId }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('employment_records');
  const [employeeId, setEmployeeId] = useState(preselectedEmployeeId || '');
  const [uploading, setUploading] = useState(false);
  
  const { uploadDocument } = useDocuments();
  const { employees } = useEmployees();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('DocumentUpload component - User:', user?.id, 'Employees count:', employees.length);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      console.log('File selected:', selectedFile.name);
    }
  };

  const handleUpload = async () => {
    console.log('Upload button clicked');
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload documents",
        variant: "destructive",
      });
      return;
    }

    if (!file || !title) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log('Starting upload process...');
    
    try {
      const result = await uploadDocument(
        file,
        title,
        description,
        category as any,
        employeeId || undefined
      );

      if (result.error) {
        console.error('Upload failed:', result.error);
        toast({
          title: "Upload Failed",
          description: result.error.message || "Failed to upload document",
          variant: "destructive",
        });
      } else {
        console.log('Upload successful');
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
        
        // Reset form
        setFile(null);
        setTitle('');
        setDescription('');
        setCategory('employment_records');
        if (!preselectedEmployeeId) {
          setEmployeeId('');
        }
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        onSuccess?.();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Upload className="h-5 w-5 text-white" />
          </div>
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="file-upload" className="text-sm font-medium text-slate-700">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
          {file && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{file.name}</span>
              <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="title" className="text-sm font-medium text-slate-700">Document Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description"
            rows={3}
            className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-slate-700">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-lg">
              <SelectItem value="employment_records">Employment Records</SelectItem>
              <SelectItem value="disciplinary_records">Disciplinary Records</SelectItem>
              <SelectItem value="performance_records">Performance Records</SelectItem>
              <SelectItem value="leave_requests">Leave Requests</SelectItem>
              <SelectItem value="interview_records">Interview Records</SelectItem>
              <SelectItem value="shared_documents">Shared Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!preselectedEmployeeId && (
          <div>
            <Label htmlFor="employee" className="text-sm font-medium text-slate-700">Assign to Employee (Optional)</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-lg">
                <SelectItem value="none">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} - {employee.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || !title || uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          ) : (
            'Upload Document'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
