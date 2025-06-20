
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

interface EmployeeProfileProps {
  employee: any;
  onClose: () => void;
}

const EmployeeProfile = ({ employee, onClose }: EmployeeProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(employee);
  const { toast } = useToast();

  // Mock documents data for the employee
  const employeeDocuments = [
    {
      id: 1,
      title: 'Employment Contract',
      category: 'contracts',
      file_type: 'PDF',
      file_size: '245 KB',
      upload_date: '2022-03-15',
      status: 'signed',
      requires_signature: true
    },
    {
      id: 2,
      title: 'Teaching Certification',
      category: 'certifications',
      file_type: 'PDF',
      file_size: '180 KB',
      upload_date: '2022-03-20',
      status: 'active',
      requires_signature: false
    },
    {
      id: 3,
      title: 'Performance Review 2024',
      category: 'evaluations',
      file_type: 'PDF',
      file_size: '156 KB',
      upload_date: '2024-12-01',
      status: 'completed',
      requires_signature: false
    },
    {
      id: 4,
      title: 'Emergency Contact Form',
      category: 'personal',
      file_type: 'PDF',
      file_size: '98 KB',
      upload_date: '2022-03-16',
      status: 'active',
      requires_signature: false
    },
    {
      id: 5,
      title: 'Training Certificate - First Aid',
      category: 'training',
      file_type: 'PDF',
      file_size: '205 KB',
      upload_date: '2023-08-15',
      status: 'expires_soon',
      requires_signature: false,
      expiry_date: '2025-08-15'
    }
  ];

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

  const getDocumentStatusBadge = (status: string) => {
    const variants = {
      signed: { variant: 'default' as const, label: 'Signed' },
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'default' as const, label: 'Completed' },
      expires_soon: { variant: 'destructive' as const, label: 'Expires Soon' },
      expired: { variant: 'destructive' as const, label: 'Expired' },
      pending: { variant: 'secondary' as const, label: 'Pending' }
    };

    const config = variants[status as keyof typeof variants] || { variant: 'secondary' as const, label: status };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      contracts: Briefcase,
      certifications: Award,
      evaluations: FileText,
      personal: User,
      training: Award
    };
    
    const Icon = icons[category as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Profile: {employee.name}
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
                          value={editData.firstName || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-gray-600">{employee.name.split(' ')[0]}</p>
                      )}
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      {isEditing ? (
                        <Input
                          value={editData.lastName || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-gray-600">{employee.name.split(' ').slice(1).join(' ')}</p>
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
                      <p className="text-sm text-gray-600">{employee.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.address || '123 Main St, City, State 12345'}
                        onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">123 Main St, City, State 12345</p>
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
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-600">{employee.department}</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Join Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editData.joinDate || employee.joinDate}
                        onChange={(e) => setEditData(prev => ({ ...prev, joinDate: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{employee.joinDate}</p>
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
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label>Employee ID</Label>
                    <p className="text-sm text-gray-600">EMP-{employee.id.toString().padStart(4, '0')}</p>
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
                        value={editData.emergencyContactName || 'Jane Doe'}
                        onChange={(e) => setEditData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">Jane Doe</p>
                    )}
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    {isEditing ? (
                      <Input
                        value={editData.emergencyContactRelation || 'Spouse'}
                        onChange={(e) => setEditData(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">Spouse</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editData.emergencyContactPhone || '+1 (555) 987-6543'}
                        onChange={(e) => setEditData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">+1 (555) 987-6543</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Employee Documents</h3>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid gap-4">
              {employeeDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(doc.category)}
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{doc.file_type}</span>
                            <span>•</span>
                            <span>{doc.file_size}</span>
                            <span>•</span>
                            <span>Uploaded {doc.upload_date}</span>
                            {doc.expiry_date && (
                              <>
                                <span>•</span>
                                <span className="text-orange-600">Expires {doc.expiry_date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDocumentStatusBadge(doc.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
