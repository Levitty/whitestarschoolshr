import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowUpDown, Search, Target, TrendingUp, Users, Loader2, AlertTriangle } from 'lucide-react';
import { useSalesPerformance, SalesPerformanceWithEmployee } from '@/hooks/useSalesPerformance';
import { usePIP } from '@/hooks/usePIP';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

interface PIPStatus {
  [employeeId: string]: boolean;
}

export const SalesTeamDashboard = () => {
  const [teamData, setTeamData] = useState<SalesPerformanceWithEmployee[]>([]);
  const [pipStatuses, setPIPStatuses] = useState<PIPStatus>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { loading, fetchSalesTeamPerformance } = useSalesPerformance();
  const { fetchAllActivePIPs } = usePIP();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [data, pips] = await Promise.all([
      fetchSalesTeamPerformance(),
      fetchAllActivePIPs()
    ]);
    
    setTeamData(data);
    
    // Create a map of employee IDs with active PIPs
    const pipMap: PIPStatus = {};
    pips.forEach(pip => {
      pipMap[pip.employee_id] = true;
    });
    setPIPStatuses(pipMap);
  };

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(teamData.map(d => d.employee_profiles.department));
    return Array.from(depts).filter(Boolean).sort();
  }, [teamData]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalTarget = teamData.reduce((sum, d) => sum + d.target_amount, 0);
    const totalActual = teamData.reduce((sum, d) => sum + d.actual_sales, 0);
    const avgAchievement = teamData.length > 0 
      ? teamData.reduce((sum, d) => {
          const achievement = d.target_amount > 0 ? (d.actual_sales / d.target_amount) * 100 : 0;
          return sum + achievement;
        }, 0) / teamData.length
      : 0;
    
    return { totalTarget, totalActual, avgAchievement };
  }, [teamData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...teamData];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.employee_profiles.first_name.toLowerCase().includes(term) ||
        d.employee_profiles.last_name.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(d => d.employee_profiles.department === departmentFilter);
    }

    // Sort by achievement
    result.sort((a, b) => {
      const achievementA = a.target_amount > 0 ? (a.actual_sales / a.target_amount) * 100 : 0;
      const achievementB = b.target_amount > 0 ? (b.actual_sales / b.target_amount) * 100 : 0;
      return sortOrder === 'asc' ? achievementA - achievementB : achievementB - achievementA;
    });

    return result;
  }, [teamData, searchTerm, statusFilter, departmentFilter, sortOrder]);

  const handleRowClick = (profileId: string | null) => {
    if (profileId) {
      // Navigate to employees page - the profile ID can be used to open the employee profile
      navigate('/employees');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">On Track</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading && teamData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sales Team</p>
                <p className="text-2xl font-bold">{teamData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalTarget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalActual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                summaryStats.avgAchievement >= 80 ? 'bg-green-500/10' :
                summaryStats.avgAchievement >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  summaryStats.avgAchievement >= 80 ? 'text-green-500' :
                  summaryStats.avgAchievement >= 60 ? 'text-yellow-500' : 'text-red-500'
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Achievement</p>
                <p className="text-2xl font-bold">{Math.round(summaryStats.avgAchievement)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sales Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sort by achievement ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sales performance data found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead>Achievement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PIP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => {
                    const achievement = record.target_amount > 0 
                      ? Math.round((record.actual_sales / record.target_amount) * 100) 
                      : 0;
                    const hasPIP = pipStatuses[record.employee_id];

                    return (
                      <TableRow 
                        key={record.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(record.employee_profiles.profile_id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={record.employee_profiles.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(record.employee_profiles.first_name, record.employee_profiles.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {record.employee_profiles.first_name} {record.employee_profiles.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.employee_profiles.department}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(record.target_amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(record.actual_sales)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress 
                              value={Math.min(achievement, 100)} 
                              className={`h-2 flex-1 ${
                                achievement >= 80 ? '[&>div]:bg-green-500' : 
                                achievement >= 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                              }`}
                            />
                            <span className={`text-sm font-medium w-12 text-right ${
                              achievement >= 80 ? 'text-green-600' : 
                              achievement >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {achievement}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell>
                          {hasPIP && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              On PIP
                            </Badge>
                          )}
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
