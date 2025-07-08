
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
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
            {getInitials(employee.first_name, employee.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 truncate mb-1">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm font-medium text-blue-600 mb-1">{employee.position}</p>
            <p className="text-sm text-slate-600">{employee.department}</p>
          </div>
          <UIBadge variant={employee.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
            {employee.status}
          </UIBadge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Mail className="mr-3 h-4 w-4 text-slate-400" />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="mr-3 h-4 w-4 text-slate-400" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-3">
            Hired: {new Date(employee.hire_date).toLocaleDateString()}
          </p>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 hover:bg-slate-50 transition-colors"
              onClick={() => onViewProfile({
                ...employee,
                name: `${employee.first_name} ${employee.last_name}`,
                joinDate: employee.hire_date
              })}
            >
              View Profile
            </Button>
            <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
