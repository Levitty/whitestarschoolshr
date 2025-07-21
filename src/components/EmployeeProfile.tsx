import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Edit, 
  Save, 
  FileText, 
  Download, 
  Eye, 
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentUpload } from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';

interface EmployeeProfileProps {
  employee: any;
  onClose: () => void;
}

const EmployeeProfile = ({ employee, onClose }: EmployeeProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(employee);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: Implement actual save logic
    toast({
      title: "Profile Updated",
      description: "Employee profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(employee);
    setIsEditing(false);
  };

  const handleDocumentUploadSuccess = () => {
    setShowDocumentUpload(false);
    toast({
      title: "Success",
      description: "Document uploaded successfully for this employee",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Profile: {employee.first_name} {employee.last_name}
          </DialogTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
              </>
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      {isEditing ? (
                        <Input
                          value={editData.firstName || employee.first_name}
                          onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-gray-600">{employee.first_name}</p>
                      )}
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      {isEditing ? (
                        <Input
                          value={editData.lastName || employee.last_name}
                          onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-gray-600">{employee.last_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.email || employee.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.email}</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.phone || employee.phone}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.address || employee.address || 'Not provided'}
                        onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.address || 'Not provided'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Position</Label>
                    {isEditing ? (
                      <Input
                        value={editData.position || employee.position}
                        onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.position}</p>
                    )}
                  </div>

                  <div>
                    <Label>Department</Label>
                    {isEditing ? (
                      <Select
                        value={editData.department || employee.department}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-600">{employee.department}</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Hire Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editData.hire_date || employee.hire_date}
                        onChange={(e) => setEditData(prev => ({ ...prev, hire_date: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.hire_date}</p>
                    )}
                  </div>

                  <div>
                    <Label>Employment Status</Label>
                    {isEditing ? (
                      <Select
                        value={editData.status || employee.status}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label>Employee Number</Label>
                    <p className="text-sm text-gray-600">{employee.employee_number}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.emergency_contact_name || employee.emergency_contact_name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.emergency_contact_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    {isEditing ? (
                      <Input
                        value={editData.emergency_contact_relationship || employee.emergency_contact_relationship || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.emergency_contact_relationship || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editData.emergency_contact_phone || employee.emergency_contact_phone || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.emergency_contact_phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid gap-6">
              <DocumentUpload 
                employeeId={employee.id} 
                onSuccess={() => window.location.reload()} 
              />
              <DocumentsList />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <h3 className="text-lg font-semibold">Performance History</h3>
            
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Annual Review 2024</h4>
                    <Badge>Excellent</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Overall:</span> 4.5/5
                    </div>
                    <div>
                      <span className="font-medium">Teaching:</span> 5/5
                    </div>
                    <div>
                      <span className="font-medium">Leadership:</span> 4/5
                    </div>
                    <div>
                      <span className="font-medium">Innovation:</span> 4/5
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Excellent performance with innovative teaching methods. Recommended for leadership development program.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Mid-Year Review 2024</h4>
                    <Badge variant="secondary">Good</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Overall:</span> 4.2/5
                    </div>
                    <div>
                      <span className="font-medium">Teaching:</span> 4/5
                    </div>
                    <div>
                      <span className="font-medium">Leadership:</span> 4/5
                    </div>
                    <div>
                      <span className="font-medium">Innovation:</span> 5/5
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Strong performance with exceptional innovation in curriculum design.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Certifications & Training</h3>
              <Button>
                <Award className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Master of Education - Mathematics</h4>
                        <p className="text-sm text-gray-600">University of Education • Issued: May 2020</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Teaching License - Secondary Mathematics</h4>
                        <p className="text-sm text-gray-600">State Education Board • Expires: June 2025</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium">First Aid & CPR Certification</h4>
                        <p className="text-sm text-gray-600">Red Cross • Expires: August 2025</p>
                      </div>
                    </div>
                    <Badge variant="destructive">Expires Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfile;
