
import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { UserRole, User } from '../types';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pre-fill with a teacher account for demo convenience
  const [email, setEmail] = useState('teacher@stemverse.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network request and Role Assignment logic
    setTimeout(() => {
      let roles: UserRole[] = [UserRole.STUDENT];
      let firstName = 'Student';
      let avatarSeed = 'Felix';

      if (email.toLowerCase().includes('admin')) {
        roles = [UserRole.SCHOOL_ADMIN, UserRole.TEACHER]; // Example: Admin is also a Teacher
        firstName = 'Admin';
        avatarSeed = 'Aneka';
      } else if (email.toLowerCase().includes('teacher')) {
        roles = [UserRole.TEACHER];
        firstName = 'Teacher';
        avatarSeed = 'Jack';
      } else if (email.toLowerCase().includes('tutor')) {
        roles = [UserRole.TUTOR];
        firstName = 'Tutor';
        avatarSeed = 'Sorelle';
      }

      const mockUser: User = {
        id: `u-${Date.now()}`,
        first_name: firstName,
        last_name: 'User',
        email: email,
        roles: roles,
        bio: 'Passionate about STEM education and gamified learning.',
        interests: ['Robotics', 'AI', 'Mathematics'],
        xp: roles.includes(UserRole.STUDENT) ? 1250 : undefined,
        level: roles.includes(UserRole.STUDENT) ? 5 : undefined,
        coins: 450,
        streak: 12,
        active: true,
        avatarConfig: {
          seed: avatarSeed,
          backgroundColor: 'b6e3f4',
          accessories: 'glasses'
        }
      };

      login(mockUser);
      setIsLoading(false);
      
      // Intelligent Redirect based on Role
      if (roles.includes(UserRole.STUDENT) && roles.length === 1) {
          navigate('/student-dashboard');
      } else {
          navigate('/dashboard');
      }
    }, 1200);
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
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
                  placeholder="teacher@stemverse.com"
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

          <div className="mt-8 pt-6 border-t border-slate-100">
             <p className="text-center text-sm text-slate-500">
               Don't have an account?{' '}
               <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-bold">
                 Sign up
               </Link>
             </p>
          </div>

          <div className="mt-8">
             <p className="text-xs text-center text-slate-400 uppercase font-bold mb-4">Demo Accounts</p>
             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setEmail('student@stemverse.com')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded border text-slate-600 bg-white">Student</button>
                <button onClick={() => setEmail('teacher@stemverse.com')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded border text-slate-600 bg-white">Teacher</button>
                <button onClick={() => setEmail('admin@stemverse.com')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded border text-slate-600 bg-white">Admin</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
