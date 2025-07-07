
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/useEmployees';
import { AlertTriangle, Calendar, Users } from 'lucide-react';

const ContractExpiry = () => {
  const { getExpiringContracts } = useEmployees();
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiringContracts();
  }, []);

  const fetchExpiringContracts = async () => {
    setLoading(true);
    try {
      const contracts = await getExpiringContracts();
      setExpiringContracts(contracts);
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) return { variant: 'destructive' as const, label: 'Critical' };
    if (daysUntilExpiry <= 30) return { variant: 'destructive' as const, label: 'Urgent' };
    if (daysUntilExpiry <= 90) return { variant: 'secondary' as const, label: 'Soon' };
    return { variant: 'default' as const, label: 'Normal' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading contract information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Contract Expiry Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expiringContracts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>No contracts expiring in the next 90 days</p>
            <p className="text-sm mt-2">All employee contracts are up to date</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringContracts.map((contract) => {
              const status = getExpiryStatus(contract.days_until_expiry);
              return (
                <div key={contract.employee_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{contract.employee_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Expires: {new Date(contract.contract_end_date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({contract.days_until_expiry} days)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Renew
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={fetchExpiringContracts}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractExpiry;
