
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Filter, Video, FileText, GraduationCap } from 'lucide-react';
import { mockExams } from './ExamManagement';

// Mock Data Types mirroring the system's modules
type EventType = 'exam' | 'class' | 'assignment' | 'project';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  type: EventType;
  location?: string; // Room or URL
  description?: string;
}

// Static mocks for other types (simulating data from other modules)
const staticEvents: CalendarEvent[] = [
  // Classes (from SchoolManagement Timetable)
  { id: 'c1', title: 'Physics 101', date: '2023-10-16', startTime: '08:00', endTime: '09:00', type: 'class', location: 'Room 101' },
  { id: 'c2', title: 'English Lit', date: '2023-10-16', startTime: '09:00', endTime: '10:00', type: 'class', location: 'Room 102' },
  { id: 'c3', title: 'Physics 101', date: '2023-10-23', startTime: '08:00', endTime: '09:00', type: 'class', location: 'Room 101' },
  
  // Assignments (from CourseStudio)
  { id: 'a1', title: 'Robotics Lab Report', date: '2023-10-18', startTime: '23:59', type: 'assignment', description: 'Submit via LMS' },
  { id: 'a2', title: 'Python Project', date: '2023-10-25', startTime: '17:00', type: 'project', description: 'Group submission' },
  
  // Live Classes
  { id: 'l1', title: 'Live: Circuit Building', date: '2023-10-14', startTime: '10:00', endTime: '11:00', type: 'class', location: 'Zoom' },
];

const getEventTypeColor = (type: EventType) => {
  switch(type) {
    case 'exam': return 'bg-red-100 text-red-700 border-red-200';
    case 'class': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'assignment': return 'bg-green-50 text-green-700 border-green-100';
    case 'project': return 'bg-purple-50 text-purple-700 border-purple-100';
    default: return 'bg-slate-50 text-slate-700';
  }
};

const getEventTypeIcon = (type: EventType) => {
  switch(type) {
    case 'exam': return <GraduationCap className="w-3 h-3" />;
    case 'class': return <Video className="w-3 h-3" />;
    case 'assignment': return <FileText className="w-3 h-3" />;
    case 'project': return <CalendarIcon className="w-3 h-3" />;
  }
};

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2023-10-01')); // Fixed date for mock data visibility
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
      // Transform Exams to Calendar Events
      const examEvents: CalendarEvent[] = mockExams
          .filter(e => e.scheduled_date)
          .map(e => ({
              id: e.id,
              title: e.title,
              date: e.scheduled_date!,
              startTime: e.scheduled_time,
              type: 'exam',
              location: e.class_id, // Using class as location proxy
              description: `Subject: ${e.subject_id}`
          }));

      setAllEvents([...staticEvents, ...examEvents]);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  // Helper to shift months
  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  // Filter events
  const filteredEvents = allEvents.filter(e => filter === 'all' || e.type === filter);

  // Generate calendar grid cells
  const renderCalendarGrid = () => {
    const days = [];
    const blanks = Array(firstDayOfMonth).fill(null);
    const dayCount = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const allCells = [...blanks, ...dayCount];

    return allCells.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="bg-slate-50/30 min-h-[100px] border-b border-r border-slate-100"></div>;

      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(e => e.date === dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      return (
        <div 
          key={dateStr} 
          onClick={() => setSelectedDate(dateStr)}
          className={`min-h-[100px] border-b border-r border-slate-100 p-2 cursor-pointer transition-colors relative group ${
            isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
          }`}
        >
          <span className={`text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full mb-1 ${
            isToday ? 'bg-indigo-600 text-white' : 'text-slate-500'
          }`}>
            {day}
          </span>
          
          <div className="space-y-1">
            {dayEvents.map((event, i) => (
              <div 
                key={event.id} 
                className={`text-[10px] px-1.5 py-1 rounded border truncate font-medium flex items-center gap-1 ${getEventTypeColor(event.type)}`}
                title={event.title}
              >
                {/* Only show first 3 events on mobile/small screens, visually hidden logic handled by CSS if needed */}
                {i < 3 && (
                    <>
                        {getEventTypeIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                    </>
                )}
              </div>
            ))}
            {dayEvents.length > 3 && (
                <div className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    });
  };

  const selectedDateEvents = selectedDate 
    ? filteredEvents.filter(e => e.date === selectedDate)
    : [];

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Calendar</h1>
          <p className="text-slate-500">Track exams, classes, and deadlines in one place.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center px-3 border-r border-slate-200">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
                >
                    <option value="all">All Events</option>
                    <option value="exam">Exams</option>
                    <option value="class">Classes</option>
                    <option value="assignment">Assignments</option>
                </select>
            </div>
            <div className="flex items-center">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
                <span className="w-32 text-center font-bold text-slate-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
                  {renderCalendarGrid()}
              </div>
          </div>

          {/* Side Panel (Details) */}
          <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-indigo-600" /> 
                      {selectedDate ? new Date(selectedDate).toDateString() : 'Select a date'}
                  </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!selectedDate ? (
                      <div className="text-center py-10 text-slate-400">
                          <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Click a date on the calendar to view details.</p>
                      </div>
                  ) : selectedDateEvents.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                          <p>No events scheduled for this day.</p>
                          <button className="mt-4 text-indigo-600 text-sm font-bold hover:underline">+ Add Reminder</button>
                      </div>
                  ) : (
                      selectedDateEvents.map(event => (
                          <div key={event.id} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-white">
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getEventTypeColor(event.type)}`}>
                                      {event.type}
                                  </span>
                                  {event.startTime && (
                                      <span className="text-xs font-medium text-slate-500 flex items-center">
                                          <Clock className="w-3 h-3 mr-1" /> {event.startTime}
                                      </span>
                                  )}
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm mb-1">{event.title}</h4>
                              {event.location && (
                                  <p className="text-xs text-slate-500 flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" /> {event.location}
                                  </p>
                              )}
                              {event.description && (
                                  <p className="text-xs text-slate-400 mt-2 border-t border-slate-50 pt-2">
                                      {event.description}
                                  </p>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};