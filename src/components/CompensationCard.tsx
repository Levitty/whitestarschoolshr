import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

interface CompensationCardProps {
  baseSalary?: number | null;
  commissionTier?: string;
  department?: string;
}

const CompensationCard = ({ 
  baseSalary, 
  commissionTier = '5% on Gross Sales',
  department 
}: CompensationCardProps) => {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'Not Set';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine if employee is in a sales-eligible department
  const isSalesEligible = department?.toLowerCase().includes('sales');

  return (
    <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Compensation Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Salary */}
          <div className="p-4 rounded-xl bg-white dark:bg-card border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Base Salary</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(baseSalary)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Monthly gross pay</p>
          </div>
          
          {/* Commission Tier */}
          <div className="p-4 rounded-xl bg-white dark:bg-card border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Percent className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Commission Tier</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {commissionTier}
            </p>
            {isSalesEligible ? (
              <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Sales Eligible
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Standard compensation</p>
            )}
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
          <p>
            Commission is calculated based on monthly sales performance. 
            View the Performance tab for detailed commission calculations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompensationCard;
