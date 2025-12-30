
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Management</h1>
          <p className="text-gray-600">Teacher evaluations and performance tracking</p>
        </div>
        {canCreateEvaluation && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </Button>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="evaluations" className="flex items-center gap-1 text-xs md:text-sm px-2">
            <Star className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Evaluations</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs md:text-sm px-2">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1 text-xs md:text-sm px-2">
            <Target className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1 text-xs md:text-sm px-2">
            <MessageCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Teacher Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Comprehensive teacher appraisal system with 4 key areas: Academic Achievement, School Culture, 
                Professional Development, and Customer Relationship. Each area is weighted equally (20%) 
                to calculate the overall rating.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">Academic Achievement</div>
                  <div className="text-sm text-gray-600">20% Weight</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">School Culture</div>
                  <div className="text-sm text-gray-600">20% Weight</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">Professional Development</div>
                  <div className="text-sm text-gray-600">20% Weight</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">Customer Relationship</div>
                  <div className="text-sm text-gray-600">20% Weight</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EvaluationsList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Visual analytics and insights from teacher evaluations across departments and performance areas.
              </p>
            </CardContent>
          </Card>
          
          <EvaluationAnalytics />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals & Development Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatically generated development goals based on evaluation scores. Focus areas with scores below 4.0 
                generate specific improvement suggestions.
              </p>
            </CardContent>
          </Card>
          
          <EvaluationGoalsSuggestions />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Student & Parent Feedback Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
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
