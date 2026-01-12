
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Target, Users, MessageCircle, Star } from 'lucide-react';
import CreateEvaluationForm from '@/components/CreateEvaluationForm';
import EvaluationsList from '@/components/EvaluationsList';
import EvaluationAnalytics from '@/components/EvaluationAnalytics';
import EvaluationGoalsSuggestions from '@/components/EvaluationGoalsSuggestions';
import StudentParentFeedback from '@/components/StudentParentFeedback';
import { useProfile } from '@/hooks/useProfile';

const Performance = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('evaluations');
  const { canAccessAdmin, canAccessSuperAdmin } = useProfile();
  const canCreateEvaluation = canAccessAdmin() || canAccessSuperAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground">Teacher evaluations and performance tracking</p>
        </div>
        {canCreateEvaluation && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </Button>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="evaluations" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Star className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Evaluations</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Target className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1 text-xs md:text-sm px-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MessageCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Star className="h-5 w-5 text-amber-500" />
                Teacher Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comprehensive teacher appraisal system with 4 key areas: Academic Achievement, School Culture, 
                Professional Development, and Customer Relationship. Each area is weighted equally (20%) 
                to calculate the overall rating.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Academic Achievement</div>
                  <div className="text-xs text-muted-foreground mt-1">20% Weight</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">School Culture</div>
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
        </TabsContent>

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
                Visual analytics and insights from teacher evaluations across departments and performance areas.
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
      </Tabs>

      {/* Create Evaluation Form */}
      {canCreateEvaluation && (
        <CreateEvaluationForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default Performance;
