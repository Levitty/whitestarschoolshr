
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-semibold text-foreground">
              Employee Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your team members and their information</p>
          </div>
          <AddEmployeeForm />
        </div>

        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 border border-border rounded-lg p-1">
            <TabsTrigger 
              value="employees" 
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
            >
              Employees
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="recruitment" 
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="contracts" 
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
            >
              Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card className="border-border">
              <CardContent className="p-4">
                <EmployeeSearch 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </CardContent>
            </Card>

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
              <Card className="border-border overflow-hidden">
                <DocumentUpload onSuccess={() => window.location.reload()} />
              </Card>
              <Card className="border-border overflow-hidden">
                <DocumentsList />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-6">
            <Card className="border-border overflow-hidden">
              <RecruitmentStats employees={employees} />
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <Card className="border-border overflow-hidden">
              <ContractExpiry />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Employee Profile Modal */}
        {selectedEmployee && (
          <EmployeeProfile
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            onEmployeeUpdated={() => {
              setSelectedEmployee(null);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Employees;
