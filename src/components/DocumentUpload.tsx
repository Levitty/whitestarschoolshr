
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
import { Upload, CheckCircle, LogIn } from 'lucide-react';

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
  const [dragActive, setDragActive] = useState(false);
  
  const { uploadDocument } = useDocuments();
  const { employees, loading: employeesLoading } = useEmployees();
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  console.log('DocumentUpload - Auth state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    userEmail: user?.email,
    sessionValid: !!session?.access_token,
    authLoading,
    employeesLoading,
    employeesCount: employees.length
  });

  const acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.txt', 
    '.jpg', '.jpeg', '.png', '.gif', 
    '.xls', '.xlsx', '.ppt', '.pptx'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileValidation = (selectedFile: File): boolean => {
    if (selectedFile.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }

    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF, Word document, image, or other supported file type",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name, selectedFile.type, selectedFile.size);
      if (handleFileValidation(selectedFile)) {
        setFile(selectedFile);
      } else {
        e.target.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      console.log('File dropped:', selectedFile.name, selectedFile.type, selectedFile.size);
      if (handleFileValidation(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    console.log('Upload button clicked - Auth check:', { 
      user: !!user, 
      session: !!session, 
      accessToken: !!session?.access_token 
    });
    
    if (!user) {
      console.error('No user found during upload attempt');
      toast({
        title: "Please Sign In",
        description: "You must be signed in to upload documents. Please sign in and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!session || !session.access_token) {
      console.error('No valid session during upload attempt');
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign out and sign back in.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the document",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log('Starting upload process for:', file.name, 'User:', user.id);
    
    try {
      // Only pass employeeId if it's actually selected and not empty
      const selectedEmployeeId = employeeId && employeeId.trim() !== '' ? employeeId : undefined;
      
      console.log('Uploading with params:', {
        fileName: file.name,
        title: title.trim(),
        category,
        selectedEmployeeId,
        userId: user.id
      });
      
      const result = await uploadDocument(
        file,
        title.trim(),
        description.trim(),
        category as any,
        selectedEmployeeId
      );

      if (result.error) {
        console.error('Upload failed with error:', result.error);
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
        description: "An unexpected error occurred while uploading",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show authentication warning if not properly authenticated
  if (!user || !session) {
    return (
      <Card className="w-full border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-orange-700 mb-4">
            <LogIn className="h-5 w-5" />
            <div>
              <p className="font-medium">Authentication Required</p>
              <p className="text-sm text-orange-600">Please sign in to upload documents</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          <div
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept={acceptedFileTypes.join(',')}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-600">Drop files here or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">
                Supports: PDF, Word, Excel, PowerPoint, Images (Max: 10MB)
              </p>
            </label>
          </div>
          
          {file && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">{file.name}</span>
              <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="title" className="text-sm font-medium text-slate-700">Document Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description (optional)"
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
            <Label htmlFor="employee" className="text-sm font-medium text-slate-700">
              Assign to Employee (Optional)
            </Label>
            {employeesLoading ? (
              <div className="mt-2 p-3 border rounded-lg bg-slate-50 text-slate-600">
                Loading employees...
              </div>
            ) : (
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="mt-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select employee (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  <SelectItem value="">Unassigned</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || !title.trim() || uploading || !user || !session}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
