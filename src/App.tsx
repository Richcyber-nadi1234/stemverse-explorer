
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole, User } from './types';
import { StudentDashboard } from './pages/StudentDashboard';
import api from './services/api';

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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth via API verification
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('stemverse_token');
      if (token) {
        try {
          // Verify token and get fresh user data from backend
          const response = await api.get('/users/profile');
          setUser(response.data);
        } catch (error) {
          console.error("Session expired or invalid");
          localStorage.removeItem('stemverse_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('stemverse_token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('stemverse_token');
    // Optional: Call backend logout endpoint if you implement token blacklisting
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      // In a real app, you would PATCH /users/profile here
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
              <Route path="/calendar" element={<CalendarPage />} />

            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
