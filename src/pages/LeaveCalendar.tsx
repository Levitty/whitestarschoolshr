import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { useProfile } from '@/hooks/useProfile';
import { Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  approved_by?: string;
}

const LeaveCalendar = () => {
  const { leaveRequests, loading } = useLeaveRequests();
  const { employees } = useEmployees();
  const { hasRole } = useProfile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Check if user has permission to view this page
  if (!hasRole('head')) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center">
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Filter only approved leave requests and convert to calendar events
  const calendarEvents = useMemo(() => {
    return leaveRequests
      .filter(request => request.status === 'approved')
      .map(request => {
        const employee = employees.find(emp => emp.id === request.employee_id);
        const approver = employees.find(emp => emp.id === request.approved_by);
        
        return {
          id: request.id,
          title: `${employee?.first_name || 'Unknown'} ${employee?.last_name || 'Employee'}`,
          employee_name: `${employee?.first_name || 'Unknown'} ${employee?.last_name || 'Employee'}`,
          leave_type: request.leave_type,
          start_date: request.start_date,
          end_date: request.end_date,
          reason: request.reason || undefined,
          approved_by: approver ? `${approver.first_name} ${approver.last_name}` : undefined
        };
      });
  }, [leaveRequests, employees]);

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar grid data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return calendarEvents.filter(event => {
      return dateStr >= event.start_date && dateStr <= event.end_date;
    });
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'personal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maternity':
      case 'paternity':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leave Calendar</h1>
            <p className="text-slate-600 mt-1">View approved leave requests in calendar format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {getCalendarDays().map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-2 h-24"></div>;
                    }
                    
                    const dayEvents = getEventsForDate(day);
                    const isToday = 
                      day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <div
                        key={day}
                        className={`p-1 h-24 border border-gray-200 ${
                          isToday ? 'bg-blue-50' : 'bg-white'
                        } hover:bg-gray-50 transition-colors`}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                          {day}
                        </div>
                        <div className="space-y-1 mt-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getLeaveTypeColor(event.leave_type)}`}
                              onClick={() => setSelectedEvent(event)}
                              title={`${event.employee_name} - ${event.leave_type}`}
                            >
                              <div className="truncate">{event.employee_name}</div>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Leave Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{selectedEvent.employee_name}</h3>
                      <Badge className={getLeaveTypeColor(selectedEvent.leave_type)}>
                        {selectedEvent.leave_type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Start Date:</span>
                        <p>{new Date(selectedEvent.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span>
                        <p>{new Date(selectedEvent.end_date).toLocaleDateString()}</p>
                      </div>
                      {selectedEvent.reason && (
                        <div>
                          <span className="font-medium">Reason:</span>
                          <p className="text-muted-foreground">{selectedEvent.reason}</p>
                        </div>
                      )}
                      {selectedEvent.approved_by && (
                        <div>
                          <span className="font-medium">Approved by:</span>
                          <p>{selectedEvent.approved_by}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a leave event to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Leave Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                    <span className="text-sm">Annual Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
                    <span className="text-sm">Sick Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
                    <span className="text-sm">Personal Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-pink-100 border border-pink-200"></div>
                    <span className="text-sm">Maternity/Paternity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;
