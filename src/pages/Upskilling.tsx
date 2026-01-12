
import { useState } from 'react';
import { Search, Clock, Users, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Upskilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  const courses = [
    {
      id: 1,
      title: 'Leadership Excellence',
      description: 'Develop essential leadership skills and management techniques',
      duration: '6 weeks',
      level: 'Intermediate',
      rating: 4.8,
      enrolled: 45,
      progress: 65,
      instructor: 'Dr. Sarah Wilson',
      category: 'Leadership'
    },
    {
      id: 2,
      title: 'Data Analytics Fundamentals',
      description: 'Learn data analysis, visualization, and insights generation',
      duration: '8 weeks',
      level: 'Beginner',
      rating: 4.9,
      enrolled: 32,
      progress: 0,
      instructor: 'Mike Thompson',
      category: 'Analytics'
    },
    {
      id: 3,
      title: 'Project Management Mastery',
      description: 'Master project planning, execution, and delivery strategies',
      duration: '10 weeks',
      level: 'Advanced',
      rating: 4.7,
      enrolled: 28,
      progress: 40,
      instructor: 'Jennifer Liu',
      category: 'Management'
    },
    {
      id: 4,
      title: 'Effective Communication',
      description: 'Enhance verbal and written communication skills',
      duration: '4 weeks',
      level: 'Beginner',
      rating: 4.6,
      enrolled: 67,
      progress: 90,
      instructor: 'Robert Garcia',
      category: 'Communication'
    }
  ];

  const myProgress = [
    { course: 'Leadership Excellence', progress: 65, nextDeadline: '2024-06-25' },
    { course: 'Project Management Mastery', progress: 40, nextDeadline: '2024-06-30' },
    { course: 'Effective Communication', progress: 90, nextDeadline: '2024-06-22' }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upskilling Center</h1>
          <p className="text-slate-600 mt-1">Enhance your skills with our comprehensive training programs</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
          Create Course
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'courses' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Courses
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'progress' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Progress
        </button>
      </div>

      {activeTab === 'courses' && (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{course.description}</p>
                    </div>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {course.enrolled} enrolled
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 mb-2">Instructor: {course.instructor}</p>
                      {course.progress > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {course.progress > 0 ? (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Play className="mr-2 h-4 w-4" />
                          Continue
                        </Button>
                      ) : (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Enroll Now
                        </Button>
                      )}
                      <Button variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myProgress.map((item, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{item.course}</h4>
                      <span className="text-sm text-slate-600">Due: {item.nextDeadline}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Progress value={item.progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Upskilling;
