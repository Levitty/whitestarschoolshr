
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Users, MessageCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StudentParentFeedback = () => {
  const { toast } = useToast();
  
  // Mock data - in real app, this would come from database
  const [feedbackData, setFeedbackData] = useState([
    {
      id: '1',
      teacherName: 'Sarah Johnson',
      studentFeedback: {
        averageRating: 4.2,
        totalResponses: 25,
        comments: [
          'Great teacher, explains concepts clearly',
          'Very patient and helpful',
          'Makes learning fun and engaging'
        ]
      },
      parentFeedback: {
        averageRating: 4.5,
        totalResponses: 18,
        comments: [
          'Excellent communication with parents',
          'My child has improved significantly',
          'Very responsive to concerns'
        ]
      }
    },
    {
      id: '2',
      teacherName: 'Michael Chen',
      studentFeedback: {
        averageRating: 3.8,
        totalResponses: 22,
        comments: [
          'Good teacher but sometimes hard to understand',
          'Knows the subject well',
          'Could be more patient'
        ]
      },
      parentFeedback: {
        averageRating: 4.0,
        totalResponses: 15,
        comments: [
          'Good teacher overall',
          'Regular updates on progress',
          'Professional and dedicated'
        ]
      }
    }
  ]);

  const [newFeedback, setNewFeedback] = useState({
    teacherName: '',
    feedbackType: 'student',
    rating: 5,
    comment: ''
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real app, this would save to database
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback. It will be included in the teacher's evaluation.",
    });
    
    setNewFeedback({
      teacherName: '',
      feedbackType: 'student',
      rating: 5,
      comment: ''
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Student & Parent Feedback</h3>
        <Badge variant="outline">
          Integrated into Customer Relationship scoring
        </Badge>
      </div>

      {/* Feedback Collection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Submit Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacher">Teacher Name</Label>
                <Input
                  id="teacher"
                  value={newFeedback.teacherName}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, teacherName: e.target.value }))}
                  placeholder="Enter teacher name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Feedback Type</Label>
                <select
                  id="type"
                  value={newFeedback.feedbackType}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, feedbackType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="student">Student Feedback</option>
                  <option value="parent">Parent Feedback</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={newFeedback.rating}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-20"
                />
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= newFeedback.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="comment">Comments</Label>
              <Textarea
                id="comment"
                value={newFeedback.comment}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your feedback about the teacher..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feedback Summary */}
      <div className="grid gap-6">
        {feedbackData.map((teacher) => (
          <Card key={teacher.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">{teacher.teacherName}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Student Feedback</h4>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getRatingColor(teacher.studentFeedback.averageRating)}`}>
                        {teacher.studentFeedback.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Average Rating</div>
                    </div>
                    
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= teacher.studentFeedback.averageRating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Badge variant="outline">
                      {teacher.studentFeedback.totalResponses} responses
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Recent Comments:</h5>
                    {teacher.studentFeedback.comments.map((comment, index) => (
                      <p key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        "{comment}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* Parent Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Parent Feedback</h4>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getRatingColor(teacher.parentFeedback.averageRating)}`}>
                        {teacher.parentFeedback.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Average Rating</div>
                    </div>
                    
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= teacher.parentFeedback.averageRating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Badge variant="outline">
                      {teacher.parentFeedback.totalResponses} responses
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Recent Comments:</h5>
                    {teacher.parentFeedback.comments.map((comment, index) => (
                      <p key={index} className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                        "{comment}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Impact on Evaluation */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <h5 className="font-medium text-yellow-700">Impact on Customer Relationship Score</h5>
                </div>
                <p className="text-sm text-gray-600">
                  These feedback scores contribute to the "Customer Relationship" area in teacher evaluations. 
                  Average ratings are factored into communication and responsiveness criteria.
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Current contribution:</span> 
                  <span className="ml-2">
                    Student: {teacher.studentFeedback.averageRating.toFixed(1)} | 
                    Parent: {teacher.parentFeedback.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentParentFeedback;
