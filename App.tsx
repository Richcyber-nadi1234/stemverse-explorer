
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ExamManagement } from './pages/ExamManagement';
import { Reports } from './pages/Reports';
import { SchoolManagement } from './pages/SchoolManagement';
import { QuestionBank } from './pages/QuestionBank';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { LMS } from './pages/LMS';
import { CoursePlayer } from './pages/CoursePlayer';
import { LiveClassroom } from './pages/LiveClassroom';
import { Marketplace } from './pages/Marketplace';
import { StudentExam } from './pages/StudentExam';
import { CourseStudio } from './pages/CourseStudio';
import { Grading } from './pages/Grading';
import { AITutor } from './components/AITutor';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { CourseManagement } from './pages/CourseManagement';
import { ProjectBoard } from './pages/ProjectBoard';
import { StudentReport } from './pages/StudentReport';
import { UserManagement } from './pages/UserManagement';
import { ParentDashboard } from './pages/ParentDashboard';
import { CalendarPage } from './pages/Calendar';
import { ContentReview } from './pages/ContentReview'; // Import ContentReview
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole, User, Course } from './types';
import { StudentDashboard } from './pages/StudentDashboard';
import api from './services/api';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Toast Types
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}>({ showToast: () => {} });

// Enhanced Auth Context
export const AuthContext = React.createContext<{
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

// Course Context
export const CourseContext = React.createContext<{
  courses: Course[];
  enrolledCourseIds: string[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  enrollCourse: (courseId: string) => void;
}>({
  courses: [],
  enrolledCourseIds: [],
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  enrollCourse: () => {},
});

const initialCourses: Course[] = [
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
    id: 'm3',
    title: 'Solar System 3D Models',
    description: 'Interactive 3D assets of all planets in our solar system. Perfect for science projects or VR experiments.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    instructor: 'SpaceExplorer',
    progress: 0,
    total_lessons: 8,
    completed_lessons: 0,
    category: 'Science',
    tags: ['Space', '3D'],
    students_enrolled: 120,
    rating: 4.5,
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Initialize Auth via API verification
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('stemverse_token');
      if (token) {
        try {
          // Verify token and get fresh user data from backend
          const response = await api.get('/users/profile');
          setUser(response.data);
        } catch (error: any) {
          if (!error.response || error.code === 'ERR_NETWORK') {
             const cachedUser = localStorage.getItem('stemverse_user');
             if (cachedUser) {
                 try {
                     setUser(JSON.parse(cachedUser));
                 } catch (e) {
                     localStorage.removeItem('stemverse_token');
                     localStorage.removeItem('stemverse_user');
                     setUser(null);
                 }
             } else {
                 console.error("Session expired or invalid");
                 localStorage.removeItem('stemverse_token');
                 setUser(null);
             }
          } else {
             console.error("Session expired or invalid");
             localStorage.removeItem('stemverse_token');
             localStorage.removeItem('stemverse_user');
             setUser(null);
          }
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('stemverse_token', token);
    localStorage.setItem('stemverse_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('stemverse_token');
    localStorage.removeItem('stemverse_user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('stemverse_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Toast System
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Course Actions
  const addCourse = (course: Course) => {
    setCourses(prev => [course, ...prev]);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const enrollCourse = (courseId: string) => {
      if (!enrolledCourseIds.includes(courseId)) {
          setEnrolledCourseIds(prev => [...prev, courseId]);
          // Update student count on the course itself
          const course = courses.find(c => c.id === courseId);
          if (course) {
              updateCourse({ ...course, students_enrolled: (course.students_enrolled || 0) + 1 });
          }
          showToast("Enrolled successfully!", 'success');
      }
  };

  const getDashboardPath = (roles: UserRole[]) => {
      if (roles.includes(UserRole.STUDENT) && roles.length === 1) return '/student-dashboard';
      if (roles.includes(UserRole.PARENT)) return '/parent-dashboard';
      return '/dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      <ToastContext.Provider value={{ showToast }}>
        <CourseContext.Provider value={{ courses, enrolledCourseIds, addCourse, updateCourse, deleteCourse, enrollCourse }}>
          <HashRouter>
            {/* Toast Container */}
            <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
              {toasts.map(toast => (
                <div key={toast.id} className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-2xl border-l-4 text-white transition-all duration-300 transform translate-x-0 ${
                    toast.type === 'success' ? 'bg-slate-800 border-green-500' : 
                    toast.type === 'error' ? 'bg-slate-800 border-red-500' : 'bg-slate-800 border-blue-500'
                } min-w-[300px]`}>
                  <div className={`p-1.5 rounded-full mr-3 shrink-0 ${
                      toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 
                      toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                      {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
                       toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                      <h4 className={`text-sm font-bold ${
                          toast.type === 'success' ? 'text-green-400' : 
                          toast.type === 'error' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                          {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
                  </div>
                  <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-3 text-slate-500 hover:text-white transition-colors">
                      <X className="w-4 h-4"/>
                  </button>
                </div>
              ))}
            </div>

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={user ? <Navigate to={getDashboardPath(user.roles || [])} replace /> : <Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes Wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route element={<><Layout /><AITutor /></>}>
                  
                  {/* Student Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/exam/:examId/take" element={<StudentExam />} />
                  </Route>

                  {/* Instructor Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.TUTOR, UserRole.ADMIN, UserRole.SCHOOL_ADMIN]} />}>
                    <Route path="/dashboard" element={<InstructorDashboard />} />
                    <Route path="/instructor/courses" element={<CourseManagement />} />
                    <Route path="/instructor/projects" element={<ProjectBoard />} />
                    <Route path="/instructor/student-report" element={<StudentReport />} />
                    <Route path="/studio" element={<CourseStudio />} />
                    <Route path="/grading" element={<Grading />} />
                    <Route path="/questions" element={<QuestionBank />} />
                    <Route path="/exams" element={<ExamManagement />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SCHOOL_ADMIN]} />}>
                    <Route path="/sms" element={<SchoolManagement />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/review" element={<ContentReview />} />
                  </Route>

                  {/* Parent Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.PARENT]} />}>
                    <Route path="/parent-dashboard" element={<ParentDashboard />} />
                    <Route path="/parent/report" element={<StudentReport />} />
                  </Route>

                  {/* Common Authenticated Routes */}
                  <Route path="/lms" element={<LMS />} />
                  <Route path="/lms/course/:courseId" element={<CoursePlayer />} />
                  <Route path="/live" element={<LiveClassroom />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/calendar" element={<CalendarPage />} />

                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </CourseContext.Provider>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}