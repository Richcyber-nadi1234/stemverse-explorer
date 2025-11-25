
import React, { useState } from 'react';
import { Search, Edit, Trash2, Users, Eye, MoreVertical, Plus, BookOpen, X, UserPlus, UserMinus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Course, Student } from '../types';

const mockInstructorCourses: Course[] = [
  {
    id: 'c1',
    title: 'Introduction to Robotics with Arduino',
    description: 'Learn the basics of building circuits, sensors, and programming robots.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400',
    instructor: 'You',
    progress: 0,
    total_lessons: 12,
    completed_lessons: 0,
    category: 'Robotics',
    tags: ['Engineering'],
    students_enrolled: 45,
    rating: 4.8,
    status: 'published'
  },
  {
    id: 'c2',
    title: 'Scratch Programming: Create Games',
    description: 'A visual introduction to coding.',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
    instructor: 'You',
    progress: 0,
    total_lessons: 10,
    completed_lessons: 0,
    category: 'Scratch',
    tags: ['Coding'],
    students_enrolled: 38,
    rating: 4.9,
    status: 'published'
  },
  {
    id: 'draft1',
    title: 'Advanced Python AI',
    description: 'Building neural networks from scratch.',
    thumbnail: '',
    instructor: 'You',
    progress: 0,
    total_lessons: 5,
    completed_lessons: 0,
    category: 'Python',
    tags: ['AI'],
    students_enrolled: 0,
    rating: 0,
    status: 'draft'
  }
];

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
  enrolled_at: string;
}

const mockEnrollments: Record<string, EnrolledStudent[]> = {
  'c1': [
    { id: 's1', name: 'Kwame Mensah', email: 'kwame@school.edu', progress: 45, enrolled_at: '2023-09-10' },
    { id: 's2', name: 'Ama Osei', email: 'ama@school.edu', progress: 12, enrolled_at: '2023-09-12' },
    { id: 's3', name: 'John Doe', email: 'john@school.edu', progress: 88, enrolled_at: '2023-09-05' },
  ],
  'c2': [
    { id: 's4', name: 'Sarah Smith', email: 'sarah@school.edu', progress: 100, enrolled_at: '2023-08-20' },
  ]
};

export const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(mockInstructorCourses);
  const [search, setSearch] = useState('');

  // Enrollment Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, EnrolledStudent[]>>(mockEnrollments);
  const [newStudentName, setNewStudentName] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleManageStudents = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleEnrollStudent = () => {
    if (!selectedCourse || !newStudentName.trim()) return;

    const newStudent: EnrolledStudent = {
      id: Date.now().toString(),
      name: newStudentName,
      email: `${newStudentName.toLowerCase().replace(' ', '.')}@school.edu`,
      progress: 0,
      enrolled_at: new Date().toISOString().split('T')[0]
    };

    setEnrollments(prev => ({
      ...prev,
      [selectedCourse.id]: [...(prev[selectedCourse.id] || []), newStudent]
    }));

    // Update course count
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, students_enrolled: (c.students_enrolled || 0) + 1 } : c));
    
    setNewStudentName('');
  };

  const handleUnenrollStudent = (studentId: string) => {
    if (!selectedCourse) return;
    if (window.confirm('Are you sure you want to remove this student from the course?')) {
      setEnrollments(prev => ({
        ...prev,
        [selectedCourse.id]: prev[selectedCourse.id].filter(s => s.id !== studentId)
      }));

      // Update course count
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, students_enrolled: Math.max(0, (c.students_enrolled || 0) - 1) } : c));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500">Manage your content, enrollments, and settings.</p>
        </div>
        <button 
          onClick={() => navigate('/studio')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCourses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{course.title}</div>
                      <div className="text-xs text-slate-500">{course.category} • {course.total_lessons} Lessons</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                    ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                  `}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {course.students_enrolled || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {course.rating ? `⭐ ${course.rating}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => navigate(`/studio`)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit Content">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleManageStudents(course)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Manage Enrollments">
                      <Users className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manage Enrollments Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage Enrollments</h3>
                <p className="text-sm text-slate-500">{selectedCourse.title}</p>
              </div>
              <button onClick={() => setSelectedCourse(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Add Student Form */}
              <div className="flex gap-3 mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <input 
                  type="text" 
                  value={newStudentName} 
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Enter student name..." 
                  className="flex-1 p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleEnrollStudent}
                  disabled={!newStudentName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Enroll
                </button>
              </div>

              {/* Student List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Enrolled Students ({enrollments[selectedCourse.id]?.length || 0})</h4>
                
                {(!enrollments[selectedCourse.id] || enrollments[selectedCourse.id].length === 0) ? (
                  <div className="text-center py-8 text-slate-400 flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p>No students enrolled yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                    {enrollments[selectedCourse.id].map(student => (
                      <div key={student.id} className="p-4 bg-white flex items-center justify-between hover:bg-slate-50 group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                             {student.name.charAt(0)}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-900">{student.name}</p>
                             <p className="text-xs text-slate-500">{student.email}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="w-32">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">Progress</span>
                                <span className="font-bold text-indigo-600">{student.progress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500" style={{width: `${student.progress}%`}}></div>
                              </div>
                           </div>
                           <button 
                              onClick={() => handleUnenrollStudent(student.id)}
                              className="p-2 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              title="Unenroll"
                           >
                             <UserMinus className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
