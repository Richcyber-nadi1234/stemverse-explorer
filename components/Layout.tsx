
import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
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
  Baby,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbArrow,
  Search,
  Settings,
  User as UserIcon,
  Eye // Added icon for Review
} from 'lucide-react';
import { UserRole } from '../types';
import { Logo } from './Logo';

export const Layout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'success');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbMap: Record<string, string> = {
    'lms': 'Learning Hub',
    'student-dashboard': 'Dashboard',
    'dashboard': 'Instructor Dashboard',
    'sms': 'School Management',
    'live': 'Virtual Classroom',
    'course': 'Course View',
    'exam': 'Assessment',
    'admin': 'Administration',
    'users': 'User Management',
    'review': 'Content Review'
  };

  const navigation = useMemo(() => {
    if (!user) return [];
    
    const roles = user.roles || [];

    // ADMIN Navigation
    if (roles.includes(UserRole.ADMIN) || roles.includes(UserRole.SCHOOL_ADMIN)) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'School Management', href: '/sms', icon: School },
        { name: 'User Management', href: '/admin/users', icon: UserCheck },
        { name: 'Content Review', href: '/admin/review', icon: Eye }, // Added
        { name: 'Reports & Exports', href: '/reports', icon: FileSpreadsheet },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Exam Manager', href: '/exams', icon: GraduationCap },
        { name: 'Virtual Classroom', href: '/live', icon: Video },
      ];
    }

    // TEACHER / TUTOR Navigation
    if (roles.includes(UserRole.TEACHER) || roles.includes(UserRole.TUTOR)) {
      return [
        { name: 'Instructor Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', href: '/instructor/courses', icon: Library },
        { name: 'Project Board', href: '/instructor/projects', icon: Briefcase },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Course Studio', href: '/studio', icon: PenTool },
        { name: 'Grading', href: '/grading', icon: CheckSquare },
        { name: 'Question Bank', href: '/questions', icon: FileQuestion },
        { name: 'Exam Manager', href: '/exams', icon: GraduationCap },
        { name: 'Student Reports', href: '/instructor/student-report', icon: UserCheck },
        { name: 'Virtual Classroom', href: '/live', icon: Video },
      ];
    }

    // PARENT Navigation
    if (roles.includes(UserRole.PARENT)) {
      return [
        { name: 'Parent Dashboard', href: '/parent-dashboard', icon: Baby },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
      ];
    }

    // STUDENT Navigation (Default)
    return [
      { name: 'My Dashboard', href: '/student-dashboard', icon: Home },
      { name: 'Learning Hub', href: '/lms', icon: BookOpen },
      { name: 'Live Classes', href: '/live', icon: Video },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
      { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    ];
  }, [user]);

  const NavItem: React.FC<{ item: typeof navigation[0], mobile?: boolean }> = ({ item, mobile = false }) => (
    <NavLink
      to={item.href}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      title={isCollapsed && !mobile ? item.name : ''}
      className={({ isActive }) =>
        `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all mb-1.5 group ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        } ${isCollapsed && !mobile ? 'justify-center' : ''}`
      }
    >
      <item.icon className={`w-5 h-5 ${!isCollapsed || mobile ? 'mr-3' : ''} transition-transform ${mobile ? '' : 'group-hover:scale-110'}`} />
      {(!isCollapsed || mobile) && <span>{item.name}</span>}
    </NavLink>
  );

  const avatarUrl = user?.avatarConfig?.customAvatarUrl || (user?.avatarConfig 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarConfig.seed}&backgroundColor=${user.avatarConfig.backgroundColor}&accessories=${user.avatarConfig.accessories !== 'none' ? user.avatarConfig.accessories : ''}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`);

  const displayRole = user?.roles && user.roles.length > 0 ? user.roles[0].replace('_', ' ') : 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] bg-slate-900 text-white transform transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1 shrink-0">
              <Logo className="w-full h-full" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tight text-white truncate animate-in fade-in duration-200">STEMverse</span>}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800 bg-slate-900">
          {!isCollapsed ? (
            <Link to="/profile" className="flex items-center mb-3 hover:bg-slate-800 p-2 rounded-xl transition-all group">
              <div className="w-9 h-9 rounded-full bg-indigo-500 overflow-hidden border-2 border-slate-700 group-hover:border-indigo-400 transition-colors shrink-0">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-200 group-hover:text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-slate-500 capitalize truncate group-hover:text-slate-400">
                    {user?.roles && user.roles.length > 1 ? `${user.roles.length} Roles` : displayRole}
                </p>
              </div>
            </Link>
          ) : (
             <Link to="/profile" className="flex justify-center mb-4 group">
                <div className="w-9 h-9 rounded-full bg-indigo-500 overflow-hidden border-2 border-slate-700 group-hover:border-indigo-400 transition-colors">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
             </Link>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700 ${isCollapsed ? 'justify-center' : ''}`}
            title="Sign Out"
          >
            <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors shadow-md z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-50 mr-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <nav className="hidden md:flex items-center text-sm text-slate-500 mr-6">
                 <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                 {pathSnippets.length > 0 && (
                    pathSnippets.map((snippet, index) => {
                       const path = `/${pathSnippets.slice(0, index + 1).join('/')}`;
                       const name = breadcrumbMap[snippet] || snippet.replace(/-/g, ' ');
                       const isLast = index === pathSnippets.length - 1;
                       return (
                         <React.Fragment key={path}>
                            <BreadcrumbArrow className="w-3.5 h-3.5 mx-2 text-slate-300" />
                            {isLast ? (
                                <span className="font-bold text-slate-900 capitalize truncate max-w-[150px]">{name}</span>
                            ) : (
                                <Link to={path} className="hover:text-indigo-600 transition-colors capitalize">{name}</Link>
                            )}
                         </React.Fragment>
                       )
                    })
                 )}
              </nav>

              <div className="hidden lg:flex items-center relative w-full max-w-sm ml-4">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search courses, students, or resources..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-500"
                  />
              </div>
              
              <div className="md:hidden font-bold text-slate-900 truncate ml-2">STEMverse</div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="hidden md:flex items-center text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                 System Online
              </div>
              <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </Link>
              
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center focus:outline-none"
                >
                   <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all cursor-pointer">
                     <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                            <UserIcon className="w-4 h-4 mr-2" /> My Profile
                        </Link>
                        <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Link>
                    </div>
                    <div className="border-t border-slate-50 my-1"></div>
                    <button 
                        onClick={() => { setIsProfileOpen(false); handleLogout(); }} 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
