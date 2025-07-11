
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

  console.log('Employees page - Current employees:', employees.length);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Employee Management
            </h1>
            <p className="text-slate-600 mt-1">Comprehensive employee management system</p>
          </div>
          <AddEmployeeForm />
        </div>

        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="employees" 
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Employees
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="recruitment" 
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="contracts" 
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 p-4 shadow-sm">
              <EmployeeSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

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
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                <DocumentUpload onSuccess={() => window.location.reload()} />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                <DocumentsList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm overflow-hidden">
              <RecruitmentStats employees={employees} />
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm overflow-hidden">
              <ContractExpiry />
            </div>
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
    </div>
  );
};

export default Employees;
