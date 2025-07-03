
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AddEmployeeForm from '@/components/AddEmployeeForm';

interface EmptyEmployeeStateProps {
  searchTerm: string;
}

const EmptyEmployeeState = ({ searchTerm }: EmptyEmployeeStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
        <p className="text-gray-600 mb-4">
          {searchTerm ? 'No employees match your search criteria.' : 'Get started by adding your first employee.'}
        </p>
        {!searchTerm && <AddEmployeeForm />}
      </CardContent>
    </Card>
  );
};

export default EmptyEmployeeState;
