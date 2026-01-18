import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ClipboardCheck, 
  Search, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ClearanceRecord {
  id: string;
  employee_id: string;
  status: string;
  initiated_at: string;
  completed_at: string | null;
  settlement_status: string;
  outstanding_salary: number;
  leave_balance_payout: number;
  total_deductions: number;
  final_settlement_amount: number;
  employee_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    status: string;
    department: string;
  };
  items_count?: number;
  completed_items_count?: number;
}

const SETTLEMENT_STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_calculation: { label: 'Pending', variant: 'outline' },
  calculated: { label: 'Calculated', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  paid: { label: 'Paid', variant: 'default' },
};

const ClearanceDashboard = () => {
  const [clearances, setClearances] = useState<ClearanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchClearances = async () => {
    setIsLoading(true);
    try {
      // Fetch clearances with employee profiles
      const { data: clearanceData, error: clearanceError } = await supabase
        .from('offboarding_clearance')
        .select(`
          *,
          employee_profile:employee_profiles!offboarding_clearance_employee_id_fkey(
            id, first_name, last_name, email, avatar_url, status, department
          )
        `)
        .order('initiated_at', { ascending: false });

      if (clearanceError) throw clearanceError;

      // Fetch clearance items counts
      const clearanceIds = clearanceData?.map(c => c.id) || [];
      
      const { data: itemsData } = await supabase
        .from('clearance_items')
        .select('clearance_id, is_completed')
        .in('clearance_id', clearanceIds);

      // Calculate counts per clearance
      const itemCounts: Record<string, { total: number; completed: number }> = {};
      itemsData?.forEach(item => {
        if (!itemCounts[item.clearance_id]) {
          itemCounts[item.clearance_id] = { total: 0, completed: 0 };
        }
        itemCounts[item.clearance_id].total++;
        if (item.is_completed) {
          itemCounts[item.clearance_id].completed++;
        }
      });

      const enrichedClearances = clearanceData?.map(c => ({
        ...c,
        items_count: itemCounts[c.id]?.total || 0,
        completed_items_count: itemCounts[c.id]?.completed || 0,
      })) || [];

      setClearances(enrichedClearances as ClearanceRecord[]);
    } catch (error) {
      console.error('Error fetching clearances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClearances();
  }, []);

  const filteredClearances = clearances.filter(c => {
    const matchesSearch = searchTerm === '' || 
      `${c.employee_profile?.first_name} ${c.employee_profile?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.settlement_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clearances.length,
    pending: clearances.filter(c => c.status === 'in_progress').length,
    completed: clearances.filter(c => c.status === 'completed').length,
    pendingSettlement: clearances.filter(c => c.settlement_status === 'calculated' || c.settlement_status === 'pending_calculation').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Clearances</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingSettlement}</p>
                <p className="text-xs text-muted-foreground">Pending Settlement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clearances Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Active Clearances</CardTitle>
          <CardDescription>Track and manage employee offboarding clearances</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Settlement Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_calculation">Pending Calculation</SelectItem>
                <SelectItem value="calculated">Calculated</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClearances.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h4 className="font-medium text-muted-foreground">No Clearances Found</h4>
              <p className="text-sm text-muted-foreground/70 mt-1">
                No active offboarding clearances at the moment.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Exit Type</TableHead>
                    <TableHead>Exit Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Settlement Status</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClearances.map((clearance) => {
                    const progress = clearance.items_count > 0 
                      ? (clearance.completed_items_count / clearance.items_count) * 100 
                      : 0;
                    const statusInfo = SETTLEMENT_STATUS_BADGES[clearance.settlement_status] || SETTLEMENT_STATUS_BADGES.pending_calculation;
                    const netAmount = Number(clearance.final_settlement_amount) || 0;

                    return (
                      <TableRow key={clearance.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={clearance.employee_profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {clearance.employee_profile?.first_name?.charAt(0) || 'E'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {clearance.employee_profile?.first_name} {clearance.employee_profile?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {clearance.employee_profile?.department}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={clearance.employee_profile?.status === 'terminated' ? 'destructive' : 'secondary'} className="capitalize">
                            {clearance.employee_profile?.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(clearance.initiated_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-32">
                            <div className="flex justify-between text-xs">
                              <span>{clearance.completed_items_count}/{clearance.items_count}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${netAmount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {netAmount < 0 ? '-' : ''}KES {Math.abs(netAmount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/employees?id=${clearance.employee_profile?.id}`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClearanceDashboard;
