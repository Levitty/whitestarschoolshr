
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, X } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploadProps {
  onSuccess: () => void;
  employeeId?: string; // Optional employee ID when uploading from employee profile
}

export const DocumentUpload = ({ onSuccess, employeeId }: DocumentUploadProps) => {
  const { uploadDocument } = useDocuments();
  const { canAccessSuperAdmin, canAccessAdmin } = useProfile();
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        
        // If we have an employeeId, verify it exists and get the employee details
        if (employeeId) {
          console.log('Looking for employee with ID:', employeeId);
          
          // First try to find in profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, department, email')
            .eq('id', employeeId)
            .single();

          if (profileError) {
            console.log('Profile not found, trying employee_profiles:', profileError);
            
            // If not found in profiles, try employee_profiles
            const { data: empProfileData, error: empProfileError } = await supabase
              .from('employee_profiles')
              .select('id, first_name, last_name, department, email, profile_id')
              .eq('id', employeeId)
              .single();

            if (empProfileError) {
              console.error('Employee not found in either table:', empProfileError);
              toast({
                title: "Error",
                description: "Selected employee not found. Please refresh and try again.",
                variant: "destructive"
              });
              return;
            }

            // If we found in employee_profiles, use the profile_id if available
            const finalEmployeeId = empProfileData.profile_id || empProfileData.id;
            setSelectedEmployee({ ...empProfileData, id: finalEmployeeId });
            console.log('Found employee in employee_profiles:', empProfileData);
          } else {
            setSelectedEmployee(profileData);
            console.log('Found employee in profiles:', profileData);
          }
        }

        // Always fetch all employees for the dropdown (for admin users)
        if (!employeeId && (canAccessSuperAdmin() || canAccessAdmin())) {
          const { data: allProfiles, error: allProfilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, department, email')
            .eq('is_active', true)
            .order('first_name');

          if (allProfilesError) {
            console.error('Error fetching all profiles:', allProfilesError);
          } else {
            setEmployees(allProfiles || []);
            console.log('Fetched all employees for dropdown:', allProfiles?.length);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employee information.",
          variant: "destructive"
        });
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, [employeeId, canAccessSuperAdmin, canAccessAdmin, toast]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'employment_records' as const,
    employee_id: '',
    requires_signature: false
  });

  // Update form data when selectedEmployee changes
  useEffect(() => {
    if (selectedEmployee) {
      setFormData(prev => ({ ...prev, employee_id: selectedEmployee.id }));
    }
  }, [selectedEmployee]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    // Determine which employee ID to use
    let finalEmployeeId = '';
    
    if (employeeId && selectedEmployee) {
      // We're on an employee profile page
      finalEmployeeId = selectedEmployee.id;
    } else if (!employeeId && (canAccessSuperAdmin() || canAccessAdmin()) && formData.employee_id) {
      // Admin is selecting an employee from dropdown
      finalEmployeeId = formData.employee_id;
    } else {
      toast({
        title: "Validation Error", 
        description: "Please select an employee.",
        variant: "destructive"
      });
      return;
    }

    console.log('Final employee ID for upload:', finalEmployeeId);

    setUploading(true);
    try {
      const result = await uploadDocument(
        selectedFile,
        formData.title,
        formData.description,
        formData.category,
        finalEmployeeId
      );
      
      if (result?.error) {
        console.error('Upload error:', result.error);
        toast({
          title: "Upload Failed",
          description: result.error.message || "Failed to upload document.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `Document uploaded successfully for ${selectedEmployee?.first_name || 'selected employee'}!`
        });
        
        // Reset form
        setSelectedFile(null);
        setFormData({
          title: '',
          description: '',
          category: 'employment_records',
          employee_id: selectedEmployee?.id || '',
          requires_signature: false
        });
        
        onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loadingEmployees) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Loading employee information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
          {selectedEmployee && (
            <span className="text-sm font-normal text-gray-600">
              for {selectedEmployee.first_name} {selectedEmployee.last_name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection - Only show if no employee context and user is admin */}
          {!employeeId && (canAccessSuperAdmin() || canAccessAdmin()) && (
            <div>
              <Label htmlFor="employee">Select Employee *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee to upload document for" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.department || 'No Department'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {employees.length === 0 && (
                <p className="text-sm text-red-500 mt-1">No employees found. Please check your permissions.</p>
              )}
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Document File *</Label>
            <div className="mt-2">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <Label htmlFor="file" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                    </p>
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employment_records">Employment Records</SelectItem>
                  <SelectItem value="performance_records">Performance Records</SelectItem>
                  <SelectItem value="disciplinary_records">Disciplinary Records</SelectItem>
                  <SelectItem value="leave_requests">Leave Requests</SelectItem>
                  <SelectItem value="interview_records">Interview Records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of the document"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <input
                id="signature"
                type="checkbox"
                checked={formData.requires_signature}
                onChange={(e) => setFormData(prev => ({ ...prev, requires_signature: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="signature" className="text-sm font-medium">
                This document requires a signature
              </Label>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              When enabled, the recipient will need to digitally sign this document. 
              They'll receive a notification and must provide their signature before the document is considered complete.
              This is useful for contracts, agreements, acknowledgments, and other legal documents.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={uploading || !selectedFile || !formData.title}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
