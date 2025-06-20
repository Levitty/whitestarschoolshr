import { useState } from 'react';
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmployeeProfile from '@/components/EmployeeProfile';
import SuperAdminSetup from '@/components/SuperAdminSetup';
import { useProfile } from '@/hooks/useProfile';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const { profile } = useProfile();

  const employees = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Senior Developer',
      department: 'Engineering',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      status: 'Active',
      avatar: 'SJ',
      joinDate: '2022-03-15'
    },
    {
      id: 2,
      name: 'Mike Chen',
      position: 'Product Manager',
      department: 'Product',
      email: 'mike.chen@company.com',
      phone: '+1 (555) 234-5678',
      status: 'Active',
      avatar: 'MC',
      joinDate: '2021-08-22'
    },
    {
      id: 3,
      name: 'Emily Davis',
      position: 'UX Designer',
      department: 'Design',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 345-6789',
      status: 'Active',
      avatar: 'ED',
      joinDate: '2023-01-10'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      position: 'Data Analyst',
      department: 'Analytics',
      email: 'alex.rodriguez@company.com',
      phone: '+1 (555) 456-7890',
      status: 'On Leave',
      avatar: 'AR',
      joinDate: '2022-11-05'
    }
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show Super Admin Setup if no admin exists
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to School HR Portal</h1>
          <p className="text-slate-600 mb-8">Set up your super admin account to get started</p>
        </div>
        <SuperAdminSetup />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600 mt-1">Manage your organization's workforce</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {employee.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{employee.name}</h3>
                  <p className="text-sm text-slate-600">{employee.position}</p>
                  <p className="text-sm text-slate-500">{employee.department}</p>
                </div>
                <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">Joined: {employee.joinDate}</p>
                <div className="flex space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    View Profile
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <EmployeeProfile
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default Employees;
