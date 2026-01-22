import { useState } from 'react';
import { useLoginAudit, LoginAttempt } from '@/hooks/useLoginAudit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const LoginAuditLog = () => {
  const { loginAttempts, isLoading, refetch } = useLoginAudit();
  const [searchEmail, setSearchEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  const filteredAttempts = loginAttempts.filter((attempt) => {
    const matchesEmail = attempt.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'success' && attempt.success) ||
      (filterStatus === 'failed' && !attempt.success);
    return matchesEmail && matchesStatus;
  });

  const getErrorBadge = (attempt: LoginAttempt) => {
    if (attempt.success) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </Badge>
      );
    }

    const errorType = attempt.error_type || 'unknown';
    const errorColors: Record<string, string> = {
      'invalid_credentials': 'bg-red-500',
      'email_not_confirmed': 'bg-yellow-500',
      'account_pending': 'bg-orange-500',
      'account_suspended': 'bg-red-700',
      'account_inactive': 'bg-gray-500',
      'profile_error': 'bg-purple-500',
    };

    return (
      <Badge variant="destructive" className={errorColors[errorType] || 'bg-red-500'}>
        <XCircle className="w-3 h-3 mr-1" />
        {errorType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  // Count failed attempts per email in last 24 hours
  const suspiciousEmails = loginAttempts
    .filter(a => !a.success && new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    .reduce((acc, attempt) => {
      acc[attempt.email] = (acc[attempt.email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const suspiciousCount = Object.values(suspiciousEmails).filter(count => count >= 3).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Login Audit Log
              {suspiciousCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {suspiciousCount} suspicious
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Monitor login attempts and identify potential security issues
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value: 'all' | 'success' | 'failed') => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attempts</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No login attempts found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => (
                  <TableRow 
                    key={attempt.id}
                    className={suspiciousEmails[attempt.email] >= 3 ? 'bg-red-50 dark:bg-red-950/20' : ''}
                  >
                    <TableCell className="font-medium">
                      {attempt.email}
                      {suspiciousEmails[attempt.email] >= 3 && (
                        <Badge variant="outline" className="ml-2 text-red-600 border-red-600">
                          {suspiciousEmails[attempt.email]} failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getErrorBadge(attempt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {attempt.error_message || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(attempt.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginAuditLog;
