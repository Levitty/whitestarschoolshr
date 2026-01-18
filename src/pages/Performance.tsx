import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Target, Users, MessageCircle, Star, Calculator, TrendingUp, Briefcase, CheckCircle, Clock } from 'lucide-react';
import CreateEvaluationForm from '@/components/CreateEvaluationForm';
import CreateCorporateEvaluationForm from '@/components/CreateCorporateEvaluationForm';
import EvaluationsList from '@/components/EvaluationsList';
import CorporateEvaluationsList from '@/components/CorporateEvaluationsList';
import EvaluationAnalytics from '@/components/EvaluationAnalytics';
import EvaluationGoalsSuggestions from '@/components/EvaluationGoalsSuggestions';
import StudentParentFeedback from '@/components/StudentParentFeedback';
import CommissionCalculator from '@/components/CommissionCalculator';
import { SalesTeamDashboard } from '@/components/SalesTeamDashboard';
import { useProfile } from '@/hooks/useProfile';
import { useTenantLabels } from '@/hooks/useTenantLabels';

const Performance = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('evaluations');
  const { canAccessAdmin, canAccessSuperAdmin } = useProfile();
  const { corporateFeatures, hiddenFeatures, labels, isCorporate } = useTenantLabels();
  const canCreateEvaluation = canAccessAdmin() || canAccessSuperAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground">
            {isCorporate 
              ? 'Employee evaluations, sales commissions, and performance tracking'
              : `${labels.teacher} evaluations and performance tracking`
            }
          </p>
        </div>
        {canCreateEvaluation && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </Button>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className={`grid w-full gap-1 bg-muted/50 p-1 rounded-lg ${
          corporateFeatures.salesCommission 
            ? 'grid-cols-2 md:grid-cols-6' 
            : 'grid-cols-2 md:grid-cols-4'
        }`}>
          <TabsTrigger value="evaluations" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Star className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Evaluations</span>
          </TabsTrigger>
          {corporateFeatures.salesCommission && (
            <TabsTrigger value="commission" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Calculator className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Commission</span>
            </TabsTrigger>
          )}
          {corporateFeatures.salesCommission && (
            <TabsTrigger value="sales-team" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Sales Team</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Target className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Goals</span>
          </TabsTrigger>
          {!hiddenFeatures.studentFeedback && (
            <TabsTrigger value="feedback" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">Feedback</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="evaluations" className="space-y-6">
          {isCorporate ? (
            <>
              <Card className="border-0 shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Star className="h-5 w-5 text-amber-500" />
                    Employee Performance Evaluations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive employee appraisal system with 5 key criteria: Technical Skills, Quality of Work, Productivity, Communication, and Teamwork. Each criterion is rated on a 1-5 scale.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Briefcase className="h-5 w-5 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Technical Skills</div>
                      <div className="text-xs text-muted-foreground mt-1">Job Knowledge</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <CheckCircle className="h-5 w-5 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Quality of Work</div>
                      <div className="text-xs text-muted-foreground mt-1">Accuracy & Detail</div>
                    </div>
                    <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-violet-600 dark:text-violet-400" />
                      <div className="text-sm font-bold text-violet-600 dark:text-violet-400">Productivity</div>
                      <div className="text-xs text-muted-foreground mt-1">Meeting Deadlines</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <MessageCircle className="h-5 w-5 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">Communication</div>
                      <div className="text-xs text-muted-foreground mt-1">Clear & Professional</div>
                    </div>
                    <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                      <Users className="h-5 w-5 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400">Teamwork</div>
                      <div className="text-xs text-muted-foreground mt-1">Collaboration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <CorporateEvaluationsList />
            </>
          ) : (
            <>
              <Card className="border-0 shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Star className="h-5 w-5 text-amber-500" />
                    {labels.teacher} Evaluations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive {labels.teacher.toLowerCase()} appraisal system with 4 key areas: Academic Achievement, {labels.school} Culture, Professional Development, and Customer Relationship. Each area is weighted equally (20%) to calculate the overall rating.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Academic Achievement</div>
                      <div className="text-xs text-muted-foreground mt-1">20% Weight</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{labels.school} Culture</div>
                      <div className="text-xs text-muted-foreground mt-1">20% Weight</div>
                    </div>
                    <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                      <div className="text-sm font-bold text-violet-600 dark:text-violet-400">Professional Development</div>
                      <div className="text-xs text-muted-foreground mt-1">20% Weight</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">Customer Relationship</div>
                      <div className="text-xs text-muted-foreground mt-1">20% Weight</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <EvaluationsList />
            </>
          )}
        </TabsContent>

        {/* Commission Tab - Corporate Only */}
        {corporateFeatures.salesCommission && (
          <TabsContent value="commission" className="space-y-6">
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calculator className="h-5 w-5 text-emerald-500" />
                  Sales Commission Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calculate commission payouts based on monthly sales performance against targets.
                  Commission rates are applied automatically based on achievement levels.
                </p>
              </CardContent>
            </Card>
            
            <CommissionCalculator
              evaluationType="Monthly Sales Commission Review"
              employeeName="Select Employee"
              period="January 2026"
            />
          </TabsContent>
        )}

        {/* Sales Team Tab - Corporate Only */}
        {corporateFeatures.salesCommission && (
          <TabsContent value="sales-team" className="space-y-6">
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Sales Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor your sales team's monthly performance, identify top performers, 
                  and track employees who may need performance improvement support.
                </p>
              </CardContent>
            </Card>
            
            <SalesTeamDashboard />
          </TabsContent>
        )}

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visual analytics and insights from {isCorporate ? 'employee' : 'teacher'} evaluations across departments and performance areas.
              </p>
            </CardContent>
          </Card>
          
          <EvaluationAnalytics />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-emerald-500" />
                Goals & Development Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatically generated development goals based on evaluation scores. Focus areas with scores below 4.0 
                generate specific improvement suggestions.
              </p>
            </CardContent>
          </Card>
          
          <EvaluationGoalsSuggestions />
        </TabsContent>

        {!hiddenFeatures.studentFeedback && (
          <TabsContent value="feedback" className="space-y-6">
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageCircle className="h-5 w-5 text-rose-500" />
                  Student & Parent Feedback Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Collect and aggregate student and parent feedback to inform the Customer Relationship 
                  criteria in teacher evaluations.
                </p>
              </CardContent>
            </Card>
            
            <StudentParentFeedback />
          </TabsContent>
        )}
      </Tabs>

      {/* Create Evaluation Form - Corporate vs School */}
      {canCreateEvaluation && (
        isCorporate ? (
          <CreateCorporateEvaluationForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
          />
        ) : (
          <CreateEvaluationForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
          />
        )
      )}
    </div>
  );
};

export default Performance;
