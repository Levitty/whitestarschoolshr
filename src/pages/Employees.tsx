
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeProfile from '@/components/EmployeeProfile';
import EmployeeCard from '@/components/EmployeeCard';
import EmployeeSearch from '@/components/EmployeeSearch';
import RecruitmentStats from '@/components/RecruitmentStats';
import EmptyEmployeeState from '@/components/EmptyEmployeeState';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';
import ContractExpiry from '@/components/ContractExpiry';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import { useEmployees } from '@/hooks/useEmployees';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const { employees, loading } = useEmployees();

  const filteredEmployees = employees.filter(employee =>
    employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Management</h1>
          <p className="text-slate-600 mt-1">Comprehensive employee management system</p>
        </div>
        <AddEmployeeForm />
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Employee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onViewProfile={setSelectedEmployee}
              />
            ))}
          </div>

          {filteredEmployees.length === 0 && !loading && (
            <EmptyEmployeeState searchTerm={searchTerm} />
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentUpload />
            <DocumentsList />
          </div>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-6">
          <RecruitmentStats employees={employees} />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <ContractExpiry />
        </TabsContent>
      </Tabs>

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
