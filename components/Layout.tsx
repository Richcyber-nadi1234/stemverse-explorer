
import React, { useContext } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  LayoutDashboard, 
  School, 
  BookOpen, 
  FileSpreadsheet, 
  Video, 
  ShoppingCart, 
  LogOut,
  Menu,
  X,
  FileQuestion,
  Bell,
  PenTool,
  CheckSquare,
  Briefcase,
  UserCheck,
  Library,
  Home,
  GraduationCap,
  Baby
} from 'lucide-react';
import { UserRole } from '../types';
import { Logo } from './Logo';

export const Layout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Student Specific Navigation
  const studentNavigation = [
    { name: 'My Dashboard', href: '/student-dashboard', icon: Home },
    { name: 'Learning Hub', href: '/lms', icon: BookOpen },
    { name: 'Live Classes', href: '/live', icon: Video },
    { name: 'Assignments', href: '/exams', icon: CheckSquare }, 
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  ];

  // Instructor (Teacher/Tutor) Navigation
  const instructorNavigation = [
    { name: 'Instructor Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/instructor/courses', icon: Library },
    { name: 'Project Board', href: '/instructor/projects', icon: Briefcase },
    { name: 'Course Studio', href: '/studio', icon: PenTool },
    { name: 'Grading', href: '/grading', icon: CheckSquare },
    { name: 'Question Bank', href: '/questions', icon: FileQuestion },
    { name: 'Exam Manager', href: '/exams', icon: GraduationCap },
    { name: 'Student Reports', href: '/instructor/student-report', icon: UserCheck },
    { name: 'Virtual Classroom', href: '/live', icon: Video },
  ];

  // Admin Navigation
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'School Management', href: '/sms', icon: School },
    { name: 'Reports & Exports', href: '/reports', icon: FileSpreadsheet },
    { name: 'Users & Roles', href: '/admin/users', icon: UserCheck }, 
  ];

  // Parent Navigation
  const parentNavigation = [
    { name: 'Parent Dashboard', href: '/parent-dashboard', icon: Baby },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  ];

  // Determine which navigation to show based on Roles
  let navigation: { name: string; href: string; icon: any }[] = [];
  const roles = user?.roles || [];

  // Simple priority based logic: Admin > Instructor > Student > Parent
  if (roles.includes(UserRole.ADMIN) || roles.includes(UserRole.SCHOOL_ADMIN)) {
      // Admins get admin nav + instructor tools (since they might manage content too)
      navigation = [...adminNavigation, ...instructorNavigation.slice(5)]; 
  } else if (roles.includes(UserRole.TEACHER) || roles.includes(UserRole.TUTOR)) {
      navigation = instructorNavigation;
  } else if (roles.includes(UserRole.PARENT)) {
      navigation = parentNavigation;
  } else {
      navigation = studentNavigation; 
  }

  // Deduplicate navigation items based on name (in case of overlap)
  navigation = Array.from(new Map(navigation.map(item => [item.name, item])).values());

  const NavItem: React.FC<{ item: typeof navigation[0], mobile?: boolean }> = ({ item, mobile = false }) => (
    <NavLink
      to={item.href}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all mb-1.5 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <item.icon className={`w-5 h-5 mr-3 transition-transform ${mobile ? '' : 'group-hover:scale-110'}`} />
      {item.name}
    </NavLink>
  );

  // Construct avatar URL
  const avatarUrl = user?.avatarConfig?.customAvatarUrl || (user?.avatarConfig 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarConfig.seed}&backgroundColor=${user.avatarConfig.backgroundColor}&accessories=${user.avatarConfig.accessories !== 'none' ? user.avatarConfig.accessories : ''}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`);

  // Display primary role
  const displayRole = roles.length > 0 ? roles[0].replace('_', ' ') : 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1">
                <Logo className="w-full h-full" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">STEMverse</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
            <div className="space-y-1">
                {navigation.map((item) => (
                <NavItem key={item.name} item={item} mobile />
                ))}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <Link to="/profile" className="flex items-center mb-4 hover:bg-slate-800 p-3 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-full bg-indigo-500 overflow-hidden border-2 border-slate-700 group-hover:border-indigo-400 transition-colors">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-200 group-hover:text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-slate-500 capitalize truncate group-hover:text-slate-400">
                    {roles.length > 1 ? `${roles.length} Roles` : displayRole}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-50"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="ml-3 text-lg font-bold text-slate-900">STEMverse</span>
            </div>
            
            <div className="hidden lg:flex items-center text-sm text-slate-500">
              <span>Welcome back, <span className="font-bold text-slate-900">{user?.first_name}</span></span>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              </Link>
              <Link to="/profile" className="hidden lg:block">
                 <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all">
                   <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                 </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
