
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole, User } from './types';
import { StudentDashboard } from './pages/StudentDashboard';

// Enhanced Auth Context
export const AuthContext = React.createContext<{
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('stemverse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session");
        localStorage.removeItem('stemverse_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Real-time Session Sync (Handle multi-tab logout/login)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'stemverse_user') {
        if (event.newValue) {
          setUser(JSON.parse(event.newValue));
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('stemverse_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<><Layout /><AITutor /></>}>
              
              {/* Redirect Logic for internal roots */}
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
              </Route>

              {/* Parent Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.PARENT]} />}>
                <Route path="/parent-dashboard" element={<ParentDashboard />} />
              </Route>

              {/* Common Authenticated Routes */}
              <Route path="/lms" element={<LMS />} />
              <Route path="/lms/course/:courseId" element={<CoursePlayer />} />
              <Route path="/live" element={<LiveClassroom />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />

            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
