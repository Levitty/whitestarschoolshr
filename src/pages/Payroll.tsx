import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, PlayCircle, History, FileText, BarChart3 } from 'lucide-react';
import RunPayrollForm from '@/components/payroll/RunPayrollForm';
import PayrollHistory from '@/components/payroll/PayrollHistory';
import PayrollRunDetail from '@/components/payroll/PayrollRunDetail';
import PayrollAnalytics from '@/components/payroll/PayrollAnalytics';
import { usePayroll } from '@/hooks/usePayroll';
import { useProfile } from '@/hooks/useProfile';

const Payroll = () => {
  const [selectedTab, setSelectedTab] = useState('run');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { canAccessAdmin, canAccessSuperAdmin } = useProfile();
  const isPrivileged = canAccessAdmin() || canAccessSuperAdmin();

  const handleViewRun = (runId: string) => {
    setSelectedRunId(runId);
    setSelectedTab('detail');
  };

  const handleBackToHistory = () => {
    setSelectedRunId(null);
    setSelectedTab('history');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-emerald-600" />
            Payroll Management
          </h1>
          <p className="text-muted-foreground">
            Process monthly payroll, manage statutory deductions, and generate payslips
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full gap-1 bg-muted/50 p-1 rounded-lg grid-cols-2 md:grid-cols-4">
          {isPrivileged && (
            <TabsTrigger value="run" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <PlayCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Run Payroll</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Payroll History</span>
          </TabsTrigger>
          {selectedRunId && (
            <TabsTrigger value="detail" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Payslips</span>
            </TabsTrigger>
          )}
          {isPrivileged && (
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Analytics</span>
            </TabsTrigger>
          )}
        </TabsList>

        {isPrivileged && (
          <TabsContent value="run" className="space-y-6">
            <RunPayrollForm onPayrollCreated={(runId) => handleViewRun(runId)} />
          </TabsContent>
        )}

        <TabsContent value="history" className="space-y-6">
          <PayrollHistory onViewRun={handleViewRun} />
        </TabsContent>

        {selectedRunId && (
          <TabsContent value="detail" className="space-y-6">
            <PayrollRunDetail runId={selectedRunId} onBack={handleBackToHistory} />
          </TabsContent>
        )}

        {isPrivileged && (
          <TabsContent value="analytics" className="space-y-6">
            <PayrollAnalytics />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Payroll;
