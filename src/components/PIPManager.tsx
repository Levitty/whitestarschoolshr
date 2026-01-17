import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Target, 
  Clock, 
  CheckCircle2,
  XCircle,
  Loader2,
  Flag
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { usePIP, PIP } from '@/hooks/usePIP';
import { cn } from '@/lib/utils';

interface PIPManagerProps {
  employeeId: string;
  employeeName: string;
  onUpdate?: () => void;
}

const DEFICIENCY_OPTIONS = [
  { value: 'sales_target', label: 'Sales Target' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'conduct', label: 'Conduct' },
];

const PIPManager = ({ employeeId, employeeName, onUpdate }: PIPManagerProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePIP, setActivePIP] = useState<PIP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [deficiency, setDeficiency] = useState<'sales_target' | 'attendance' | 'conduct'>('sales_target');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [reviewDate, setReviewDate] = useState<Date | undefined>(addDays(new Date(), 30));
  
  const { loading, fetchEmployeePIP, createPIP, updatePIPStatus } = usePIP();

  useEffect(() => {
    loadPIP();
  }, [employeeId]);

  const loadPIP = async () => {
    setIsLoading(true);
    const pip = await fetchEmployeePIP(employeeId);
    setActivePIP(pip);
    setIsLoading(false);
  };

  const handleCreatePIP = async () => {
    if (!reviewDate || !expectedOutcome.trim()) return;

    const result = await createPIP({
      employee_id: employeeId,
      area_of_deficiency: deficiency,
      expected_outcome: expectedOutcome,
      review_date: reviewDate.toISOString().split('T')[0],
    });

    if (!result.error) {
      setShowCreateModal(false);
      setExpectedOutcome('');
      setDeficiency('sales_target');
      setReviewDate(addDays(new Date(), 30));
      loadPIP();
      onUpdate?.();
    }
  };

  const handleCompletePIP = async () => {
    if (!activePIP) return;
    await updatePIPStatus(activePIP.id, 'completed');
    loadPIP();
    onUpdate?.();
  };

  const handleTerminatePIP = async () => {
    if (!activePIP) return;
    await updatePIPStatus(activePIP.id, 'terminated');
    loadPIP();
    onUpdate?.();
  };

  const getTimelineProgress = (pip: PIP) => {
    const start = new Date(pip.start_date);
    const checkIn = new Date(pip.check_in_date);
    const review = new Date(pip.review_date);
    const today = new Date();

    const totalDays = differenceInDays(review, start);
    const elapsed = differenceInDays(today, start);
    const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

    return {
      progress,
      isCheckInPassed: today >= checkIn,
      isReviewDue: today >= review,
      daysRemaining: differenceInDays(review, today),
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (activePIP) {
    const timeline = getTimelineProgress(activePIP);
    
    return (
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Performance Improvement Plan
            </CardTitle>
            <Badge className="bg-amber-500 text-white">
              ⚠ On PIP
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* PIP Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-card rounded-xl border border-amber-200">
              <Label className="text-sm text-muted-foreground">Area of Deficiency</Label>
              <p className="text-lg font-semibold capitalize">
                {activePIP.area_of_deficiency.replace('_', ' ')}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-card rounded-xl border border-amber-200">
              <Label className="text-sm text-muted-foreground">Days Remaining</Label>
              <p className={cn(
                "text-lg font-semibold",
                timeline.daysRemaining <= 7 ? "text-red-600" : "text-foreground"
              )}>
                {timeline.daysRemaining > 0 ? `${timeline.daysRemaining} days` : 'Review Due!'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-card rounded-xl border border-amber-200">
            <Label className="text-sm text-muted-foreground">Expected Outcome</Label>
            <p className="text-sm mt-1">{activePIP.expected_outcome}</p>
          </div>

          {/* Timeline Visual */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-amber-200">
            <Label className="text-sm text-muted-foreground mb-4 block">PIP Timeline</Label>
            
            <div className="relative">
              {/* Progress bar background */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full" />
              
              {/* Progress bar fill */}
              <div 
                className="absolute top-4 left-0 h-1 bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${timeline.progress}%` }}
              />
              
              {/* Timeline points */}
              <div className="relative flex justify-between">
                {/* Day 1 - Start */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10",
                    "bg-amber-500 text-white"
                  )}>
                    <Flag className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Day 1</span>
                  <span className="text-xs text-muted-foreground">Start</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activePIP.start_date), 'MMM d')}
                  </span>
                </div>

                {/* Day 15 - Check-in */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10",
                    timeline.isCheckInPassed 
                      ? "bg-amber-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Day 15</span>
                  <span className="text-xs text-muted-foreground">Check-in</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activePIP.check_in_date), 'MMM d')}
                  </span>
                </div>

                {/* Day 30 - Final Review */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10",
                    timeline.isReviewDue 
                      ? "bg-amber-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    <Target className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Day 30</span>
                  <span className="text-xs text-muted-foreground">Final Review</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activePIP.review_date), 'MMM d')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCompletePIP}
              disabled={loading}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={handleTerminatePIP}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Terminate PIP
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Performance Improvement Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No active PIP for this employee. Initiate a PIP if performance improvement is required.
          </p>
          <Button 
            variant="destructive"
            onClick={() => setShowCreateModal(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Initiate PIP
          </Button>
        </CardContent>
      </Card>

      {/* Create PIP Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Initiate Performance Improvement Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You are initiating a PIP for <strong>{employeeName}</strong>. This will create a 30-day improvement plan with a mid-point check-in at Day 15.
            </p>

            {/* Area of Deficiency */}
            <div className="space-y-2">
              <Label>Area of Deficiency</Label>
              <Select value={deficiency} onValueChange={(v: any) => setDeficiency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFICIENCY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected Outcome */}
            <div className="space-y-2">
              <Label>Expected Outcome</Label>
              <Textarea
                placeholder="Describe the expected improvement and measurable goals..."
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                rows={3}
              />
            </div>

            {/* Review Date */}
            <div className="space-y-2">
              <Label>Review Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reviewDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reviewDate ? format(reviewDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={reviewDate}
                    onSelect={setReviewDate}
                    initialFocus
                    disabled={(date) => date < addDays(new Date(), 14)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Timeline Preview */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">Timeline Preview</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="text-center">
                  <p className="font-semibold">Day 1</p>
                  <p>Start</p>
                  <p>{format(new Date(), 'MMM d')}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Day 15</p>
                  <p>Check-in</p>
                  <p>{format(addDays(new Date(), 15), 'MMM d')}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Day 30</p>
                  <p>Final Review</p>
                  <p>{reviewDate ? format(reviewDate, 'MMM d') : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCreatePIP}
              disabled={loading || !expectedOutcome.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Initiate PIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PIPManager;
