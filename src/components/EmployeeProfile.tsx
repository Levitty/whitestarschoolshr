
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit, 
  Save,
  X,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeProfileProps {
  employee: {
    id: number;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    status: string;
    avatar: string;
    joinDate: string;
  };
  onClose: () => void;
}

const EmployeeProfile = ({ employee, onClose }: EmployeeProfileProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(employee);

  // Mock documents data
  const documents = [
    {
      id: 1,
      title: 'Employment Contract',
      category: 'employment_records',
      uploadDate: '2024-01-15',
      fileType: 'PDF',
      size: '2.3 MB',
      status: 'signed'
    },
    {
      id: 2,
      title: 'Performance Review Q3 2024',
      category: 'performance_records',
      uploadDate: '2024-10-15',
      fileType: 'PDF',
      size: '1.1 MB',
      status: 'approved'
    },
    {
      id: 3,
      title: 'Leave Request - Vacation',
      category: 'leave_requests',
      uploadDate: '2024-11-20',
      fileType: 'PDF',
      size: '0.8 MB',
      status: 'approved'
    },
    {
      id: 4,
      title: 'Training Certificate - Safety',
      category: 'shared_documents',
      uploadDate: '2024-09-10',
      fileType: 'PDF',
      size: '1.5 MB',
      status: 'approved'
    }
  ];

  const handleSave = () => {
    // TODO: Implement actual save logic
    toast({
      title: "Success",
      description: "Employee profile updated successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEmployee(employee);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employment_records': return 'bg-blue-100 text-blue-800';
      case 'performance_records': return 'bg-green-100 text-green-800';
      case 'leave_requests': return 'bg-yellow-100 text-yellow-800';
      case 'disciplinary_records': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Profile
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                    {employee.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                    <p className="text-gray-600">{employee.position}</p>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        value={editedEmployee.email}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <span>{employee.email}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        value={editedEmployee.phone}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    ) : (
                      <span>{employee.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        placeholder="Address"
                        defaultValue="123 Main St, City, State"
                      />
                    ) : (
                      <span>123 Main St, City, State</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Department</Label>
                    {isEditing ? (
                      <Input
                        value={editedEmployee.department}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, department: e.target.value }))}
                      />
                    ) : (
                      <p>{employee.department}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Position</Label>
                    {isEditing ? (
                      <Input
                        value={editedEmployee.position}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, position: e.target.value }))}
                      />
                    ) : (
                      <p>{employee.position}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Hire Date</Label>
                      <p>{employee.joinDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emergency-contact">Emergency Contact</Label>
                    <Input
                      id="emergency-contact"
                      placeholder="Emergency contact name and phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about the employee..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Employee Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doc.fileType}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>Uploaded {doc.uploadDate}</span>
                          </div>
                          <Badge className={getCategoryColor(doc.category)} variant="outline">
                            {doc.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === 'signed' || doc.status === 'approved' ? 'default' : 'secondary'}>
                          {doc.status.toUpperCase()}
                        </Badge>
                        <Button size="sm"variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfile;
