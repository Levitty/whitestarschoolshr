import { useState, useEffect } from 'react';
import { Mail, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { useTenantLabels } from '@/hooks/useTenantLabels';
import { usePIP } from '@/hooks/usePIP';

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
  const [hasActivePIP, setHasActivePIP] = useState(false);
  const { isCorporate } = useTenantLabels();
  const { fetchEmployeePIP } = usePIP();

  useEffect(() => {
    if (isCorporate) {
      fetchEmployeePIP(employee.id).then(pip => {
        setHasActivePIP(!!pip);
      });
    }
  }, [employee.id, isCorporate]);

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer bg-card border">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-base">
            {getInitials(employee.first_name, employee.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {employee.first_name} {employee.last_name}
              </h3>
              {isCorporate && hasActivePIP && (
                <UIBadge variant="destructive" className="text-xs shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  On PIP
                </UIBadge>
              )}
            </div>
            <p className="text-sm font-medium text-primary mb-1">{employee.position}</p>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
          </div>
          <UIBadge variant={employee.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
            {employee.status}
          </UIBadge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-3 h-4 w-4 text-muted-foreground/70" />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-3 h-4 w-4 text-muted-foreground/70" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">
            Hired: {new Date(employee.hire_date).toLocaleDateString()}
          </p>
          <div className="flex space-x-2">
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
            <Button size="sm" className="flex-1">
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
