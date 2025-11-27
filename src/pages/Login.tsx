
import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Lock, Mail, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { UserRole, User } from '../types';
import { Logo } from '../components/Logo';
import api from '../services/api';

// --- MOCK DATA FOR TESTING FALLBACK ---
const MOCK_USERS: Record<string, User> = {
  'student@stemverse.com': {
    id: 'student-1',
    first_name: 'Kwame',
    last_name: 'Mensah',
    email: 'student@stemverse.com',
    roles: [UserRole.STUDENT],
    active: true,
    level: 5,
    xp: 1200,
    coins: 450,
    streak: 12,
    avatarConfig: { seed: 'Kwame', backgroundColor: 'b6e3f4', accessories: 'glasses' }
  },
  'teacher@stemverse.com': {
    id: 'teacher-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'teacher@stemverse.com',
    roles: [UserRole.TEACHER],
    active: true,
    avatarConfig: { seed: 'John', backgroundColor: 'c0aede', accessories: 'none' }
  },
  'admin@stemverse.com': {
    id: 'admin-1',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@stemverse.com',
    roles: [UserRole.ADMIN],
    active: true
  },
  'parent@stemverse.com': {
    id: 'parent-1',
    first_name: 'Jane',
    last_name: 'Mensah',
    email: 'parent@stemverse.com',
    roles: [UserRole.PARENT],
    active: true
  }
};

export const Login: React.FC = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('teacher@stemverse.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleQuickFill = (roleEmail: string) => {
      setEmail(roleEmail);
      setPassword('password');
  };

  const handleRedirect = (roles: UserRole[]) => {
      if (roles.includes(UserRole.STUDENT) && roles.length === 1) {
          navigate('/student-dashboard');
      } else if (roles.includes(UserRole.PARENT)) {
          navigate('/parent-dashboard');
      } else {
          navigate('/dashboard');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setUsingMock(false);

    try {
      // 1. Try Real Backend API
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      if (!userData.active) {
          setIsLoading(false);
          setError("Account pending verification. Please check your email.");
          return;
      }

      login(access_token, userData);
      handleRedirect(userData.roles || []);

    } catch (err: any) {
      console.error("Backend login failed", err);
      
      // 2. Fallback to Mock Data if Network Error or Developer Mode
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      
      if (isNetworkError) {
          // Check if credentials match a mock user (simple password check for dev)
          const mockUser = MOCK_USERS[email];
          if (mockUser && password === 'password') {
              console.log("Using Mock Fallback Login");
              setUsingMock(true);
              // Simulate network delay
              setTimeout(() => {
                  login('mock-jwt-token', mockUser);
                  handleRedirect(mockUser.roles);
              }, 800);
              return;
          } else {
             setError("Network Error: Backend unreachable. Try the sample logins.");
          }
      } else {
        setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10 relative">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 p-2 bg-white rounded-2xl shadow-lg border border-slate-100 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Logo className="w-full h-full" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8">Sign in to your STEMverse account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
            </div>
          )}
          
          {usingMock && (
             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs flex items-center animate-in fade-in">
                <Info className="w-4 h-4 mr-2 shrink-0" /> Dev Mode: Using local test account
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
                  placeholder="name@school.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded bg-white"
                />
                <label htmlFor="remember-me" className="ml-2 text-slate-600">Remember me</label>
              </div>
              <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Developer Quick Login Tools */}
          <div className="mt-8 pt-6 border-t border-slate-100">
             <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Login (Testing)</p>
             <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handleQuickFill('student@stemverse.com')} className="p-2 text-xs bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border border-slate-200 transition-colors" title="Login as Student">Student</button>
                <button onClick={() => handleQuickFill('teacher@stemverse.com')} className="p-2 text-xs bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border border-slate-200 transition-colors" title="Login as Teacher">Teacher</button>
                <button onClick={() => handleQuickFill('admin@stemverse.com')} className="p-2 text-xs bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border border-slate-200 transition-colors" title="Login as Admin">Admin</button>
                <button onClick={() => handleQuickFill('parent@stemverse.com')} className="p-2 text-xs bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border border-slate-200 transition-colors" title="Login as Parent">Parent</button>
             </div>
          </div>

          <div className="mt-6 text-center text-sm">
             <p className="text-slate-500">
               Don't have an account?{' '}
               <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-bold">
                 Sign up
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
