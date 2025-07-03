
import { Mail, Phone, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  status: string;
  hire_date: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onViewProfile: (employee: any) => void;
}

const EmployeeCard = ({ employee, onViewProfile }: EmployeeCardProps) => {
  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {getInitials(employee.first_name, employee.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm text-slate-600">{employee.position}</p>
            <p className="text-sm text-slate-500">{employee.department}</p>
          </div>
          <UIBadge variant={employee.status === 'active' ? 'default' : 'secondary'}>
            {employee.status}
          </UIBadge>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <Mail className="mr-2 h-4 w-4" />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="mr-2 h-4 w-4" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Hired: {new Date(employee.hire_date).toLocaleDateString()}
          </p>
          <div className="flex space-x-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onViewProfile({
                ...employee,
                name: `${employee.first_name} ${employee.last_name}`,
                joinDate: employee.hire_date
              })}
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
  );
};

export default EmployeeCard;
