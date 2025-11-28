
import React, { useState, useMemo } from 'react';
import { User, UserRole, AuditLogEntry } from '../types';
import { Search, Filter, Edit, Trash2, Shield, UserPlus, CheckCircle, AlertCircle, Mail, Save, X, Lock, CheckSquare, Square, Power, History, FileClock, XCircle, Eye, FileText, Check, ThumbsDown, ThumbsUp, Clock, GraduationCap, School, User as UserIcon, Key } from 'lucide-react';

// Mock Data for Users
const mockUsers: User[] = [
  { id: 'u1', first_name: 'Admin', last_name: 'User', email: 'admin@stemverse.com', roles: [UserRole.ADMIN], level: 10, coins: 0, xp: 0, active: true, verificationStatus: 'verified', customPermissions: [] },
  { id: 'u2', first_name: 'Sarah', last_name: 'Mensah', email: 'sarah@school.edu', roles: [UserRole.STUDENT], level: 5, coins: 450, xp: 1200, active: true, verificationStatus: 'unverified', customPermissions: [] },
  { id: 'u3', first_name: 'Dr. K.', last_name: 'Osei', email: 'osei@school.edu', roles: [UserRole.TEACHER, UserRole.SCHOOL_ADMIN], level: 0, coins: 0, xp: 0, active: true, verificationStatus: 'verified', customPermissions: [] },
  { id: 'u4', first_name: 'John', last_name: 'Doe', email: 'john@tutor.com', roles: [UserRole.TUTOR], level: 0, coins: 0, xp: 0, active: false, verificationDocuments: ['Tutor_Cert.pdf'], verificationStatus: 'pending', customPermissions: [] }, // Pending with doc
  { id: 'u5', first_name: 'Jane', last_name: 'Smith', email: 'jane@parent.com', roles: [UserRole.PARENT], level: 0, coins: 0, xp: 0, active: true, verificationStatus: 'verified', customPermissions: [] },
  { id: 'u6', first_name: 'Kwame', last_name: 'Appiah', email: 'kwame.admin@school.edu', roles: [UserRole.SCHOOL_ADMIN], level: 0, coins: 0, xp: 0, active: true, verificationStatus: 'verified', customPermissions: [] },
  { id: 'u7', first_name: 'Future', last_name: 'Academy', email: 'admin@futureacademy.edu', roles: [UserRole.SCHOOL_ADMIN], level: 0, coins: 0, xp: 0, active: false, verificationDocuments: ['School_Reg_001.pdf'], verificationStatus: 'pending', customPermissions: [] }, // Pending School
  { id: 'u8', first_name: 'Alice', last_name: 'Wonder', email: 'alice@tutor.com', roles: [UserRole.TUTOR], level: 0, coins: 0, xp: 0, active: false, verificationStatus: 'unverified', customPermissions: [] }, // Pending Tutor NO DOC
];

const mockAuditLogs: AuditLogEntry[] = [
    { id: 'log1', actor: 'Admin User', action: 'User Created', target: 'Sarah Mensah', timestamp: '2023-10-01 09:00 AM' },
    { id: 'log2', actor: 'Admin User', action: 'Role Updated', target: 'Dr. K. Osei', details: 'Added: School Admin', timestamp: '2023-10-05 14:30 PM' },
    { id: 'log3', actor: 'System', action: 'Login', target: 'Admin User', timestamp: '2023-10-12 08:00 AM' },
    { id: 'log4', actor: 'Admin User', action: 'Account Deactivated', target: 'John Doe', timestamp: '2023-10-11 10:15 AM' },
];

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['Full System Access', 'Manage Users', 'View All Data', 'Configure Settings'],
  [UserRole.SCHOOL_ADMIN]: ['Manage School Profile', 'View School Reports', 'Manage Classes', 'Manage Timetables'],
  [UserRole.TEACHER]: ['Create Courses', 'Grade Exams', 'View Student Data', 'Manage Assignments'],
  [UserRole.TUTOR]: ['Create Content', 'Host Live Sessions', 'View Earnings'],
  [UserRole.STUDENT]: ['Access Courses', 'Take Exams', 'View Progress', 'Participate in Live Classes'],
  [UserRole.PARENT]: ['View Child Progress', 'View Attendance', 'Make Payments']
};

const PERMISSION_CATEGORIES = {
    'Administrative': ['Full System Access', 'Manage Users', 'Configure Settings', 'View All Data', 'Manage School Profile'],
    'Academic': ['Manage Classes', 'Manage Timetables', 'Create Courses', 'Create Content', 'Manage Assignments'],
    'Grading & Reports': ['Grade Exams', 'View Student Data', 'View School Reports', 'View Child Progress'],
    'Interaction': ['Host Live Sessions', 'Participate in Live Classes', 'Access Courses', 'Take Exams'],
    'Finance': ['Make Payments', 'View Earnings']
};

// Explicitly define selectable roles to ensure order and completeness
const SELECTABLE_ROLES = [
  UserRole.ADMIN,
  UserRole.SCHOOL_ADMIN,
  UserRole.TEACHER,
  UserRole.TUTOR,
  UserRole.STUDENT,
  UserRole.PARENT
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending'>('all');
  
  // Selection & Logs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  
  // Per User Logs Modal
  const [userLogsModalOpen, setUserLogsModalOpen] = useState(false);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<User | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewUser, setReviewUser] = useState<User | null>(null);
  
  // Toast State
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // --- HELPERS ---
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const logAction = (action: string, target: string, details?: string) => {
      const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          actor: 'You (Admin)',
          action,
          target,
          details,
          timestamp: new Date().toLocaleString()
      };
      setAuditLogs(prev => [newLog, ...prev]);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-slate-900 text-white border-slate-700';
      case UserRole.SCHOOL_ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.TEACHER: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case UserRole.TUTOR: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.STUDENT: return 'bg-green-100 text-green-700 border-green-200';
      case UserRole.PARENT: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleIcon = (role: UserRole) => {
      switch(role) {
          case UserRole.SCHOOL_ADMIN: return <School className="w-4 h-4" />;
          case UserRole.STUDENT: return <GraduationCap className="w-4 h-4" />;
          case UserRole.TEACHER: 
          case UserRole.TUTOR: return <UserIcon className="w-4 h-4" />;
          default: return <UserIcon className="w-4 h-4" />;
      }
  };

  const getVerificationBadge = (user: User) => {
    const status = user.verificationStatus || 'unverified';
    const styles: Record<string, string> = {
        verified: 'bg-teal-50 text-teal-700 border-teal-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        unverified: 'bg-slate-100 text-slate-500 border-slate-200'
    };
    
    const icons: Record<string, React.ReactNode> = {
        verified: <Shield className="w-3 h-3 mr-1" />,
        pending: <Clock className="w-3 h-3 mr-1" />,
        rejected: <XCircle className="w-3 h-3 mr-1" />,
        unverified: <AlertCircle className="w-3 h-3 mr-1" />
    };

    return (
        <span className={`px-2.5 py-0.5 inline-flex items-center rounded-full text-xs font-bold border capitalize ${styles[status]}`}>
            {icons[status]} {status}
        </span>
    );
  };

  const isPermissionInherited = (perm: string, currentRoles: UserRole[]) => {
    return currentRoles.some(role => ROLE_PERMISSIONS[role]?.includes(perm));
  };

  // --- FILTERING ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'All' || user.roles.includes(filterRole as UserRole);
      
      let matchesTab = true;
      if (activeTab === 'active') matchesTab = user.active === true;
      if (activeTab === 'pending') matchesTab = user.verificationStatus === 'pending';

      return matchesSearch && matchesRole && matchesTab;
    });
  }, [users, searchQuery, filterRole, activeTab]);

  const pendingCount = users.filter(u => u.verificationStatus === 'pending').length;

  // --- SELECTION LOGIC ---
  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === filteredUsers.length) {
          setSelectedIds(new Set());
      } else {
          const newSet = new Set(filteredUsers.map(u => u.id));
          setSelectedIds(newSet);
      }
  };

  const isAllSelected = filteredUsers.length > 0 && selectedIds.size === filteredUsers.length;

  // --- BULK ACTIONS ---
  const handleBulkStatus = (active: boolean) => {
      const count = selectedIds.size;
      if (!window.confirm(`Are you sure you want to ${active ? 'activate' : 'deactivate'} ${count} users?`)) return;

      setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, active } : u));
      logAction(active ? 'Bulk Activation' : 'Bulk Deactivation', `${count} users updated`);
      showNotification('success', `${count} users ${active ? 'activated' : 'deactivated'} successfully.`);
      setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
      const count = selectedIds.size;
      if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${count} users?`)) return;

      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
      logAction('Bulk Deletion', `${count} users removed`);
      showNotification('success', `${count} users deleted.`);
      setSelectedIds(new Set());
  };

  // --- INDIVIDUAL CRUD ---
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user, customPermissions: user.customPermissions || [] });
    setIsModalOpen(true);
  };

  const handleReview = (user: User) => {
      setReviewUser(user);
      setIsReviewModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      roles: [UserRole.STUDENT],
      active: true,
      customPermissions: []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      logAction('User Deleted', `${user.first_name} ${user.last_name}`);
      showNotification('success', 'User removed successfully.');
    }
  };

  const handleStatusToggle = (user: User) => {
      const newStatus = !user.active;
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: newStatus } : u));
      logAction(newStatus ? 'Account Activated' : 'Account Deactivated', `${user.first_name} ${user.last_name}`);
      showNotification('success', `User ${newStatus ? 'activated' : 'deactivated'}.`);
  };

  const handleApproveUser = () => {
      if (!reviewUser) return;
      setUsers(prev => prev.map(u => u.id === reviewUser.id ? { ...u, active: true, verificationStatus: 'verified' } : u));
      logAction('Application Approved', `${reviewUser.first_name} ${reviewUser.last_name}`);
      showNotification('success', `${reviewUser.first_name} has been approved and activated.`);
      setIsReviewModalOpen(false);
      setReviewUser(null);
  };

  const handleRejectUser = () => {
      if (!reviewUser) return;
      if (!window.confirm("Are you sure you want to reject this application? The user will remain inactive.")) return;
      setUsers(prev => prev.map(u => u.id === reviewUser.id ? { ...u, verificationStatus: 'rejected' } : u));
      logAction('Application Rejected', `${reviewUser.first_name} ${reviewUser.last_name}`);
      showNotification('success', `Application rejected.`);
      setIsReviewModalOpen(false);
      setReviewUser(null);
  };

  const handleViewLogs = (user: User) => {
      setSelectedUserForLogs(user);
      setUserLogsModalOpen(true);
  };

  const handleRoleToggle = (role: UserRole) => {
    const currentRoles = formData.roles || [];
    if (currentRoles.includes(role)) {
      setFormData({ ...formData, roles: currentRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...currentRoles, role] });
    }
  };

  const handleSave = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    if (!formData.roles || formData.roles.length === 0) {
        showNotification('error', 'A user must have at least one role.');
        return;
    }

    if (editingUser) {
      // Calculate Role Differences for Logging
      const oldRoles = editingUser.roles || [];
      const newRoles = formData.roles || [];
      const addedRoles = newRoles.filter(r => !oldRoles.includes(r)).map(r => r.replace('_', ' '));
      const removedRoles = oldRoles.filter(r => !newRoles.includes(r)).map(r => r.replace('_', ' '));
      
      let changeDetails = '';
      if (addedRoles.length) changeDetails += `Added Roles: ${addedRoles.join(', ')}. `;
      if (removedRoles.length) changeDetails += `Removed Roles: ${removedRoles.join(', ')}. `;
      if (!changeDetails) changeDetails = 'Profile details updated.';

      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
      logAction('User Updated', `${formData.first_name} ${formData.last_name}`, changeDetails);
      showNotification('success', `User updated successfully.`);
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        xp: 0, coins: 0, level: 1, streak: 0,
        active: true,
        verificationStatus: 'unverified',
        ...formData as User
      };
      setUsers(prev => [newUser, ...prev]);
      logAction('User Created', `${formData.first_name} ${formData.last_name}`, `Initial Role: ${formData.roles?.join(', ')}`);
      showNotification('success', 'New user created successfully.');
    }
    setIsModalOpen(false);
  };

  // User Specific Logs
  const userSpecificLogs = useMemo(() => {
      if (!selectedUserForLogs) return [];
      const name = `${selectedUserForLogs.first_name} ${selectedUserForLogs.last_name}`;
      return auditLogs.filter(log => log.target.includes(name) || log.target.includes(selectedUserForLogs.first_name));
  }, [auditLogs, selectedUserForLogs]);

  return (
    <div className="space-y-6 relative pb-20">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center animate-in slide-in-from-right-5 ${
          notification.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage accounts, roles, permissions, and review applications.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg mr-auto w-full sm:w-auto">
            <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                All Users
            </button>
            <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Active
            </button>
            <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Pending
                {pendingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">{pendingCount}</span>
                )}
            </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto px-2 pb-2 sm:pb-0 sm:px-0">
            <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-900 placeholder-slate-500"
            />
            </div>
            <div className="relative">
                <select 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none"
                >
                    <option value="All">All Roles</option>
                    {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</option>
                    ))}
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm px-2">
                  <CheckSquare className="w-4 h-4" /> {selectedIds.size} Selected
              </div>
              <div className="flex gap-2">
                  <button onClick={() => handleBulkStatus(true)} className="px-3 py-1.5 bg-white text-green-600 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-50">Activate</button>
                  <button onClick={() => handleBulkStatus(false)} className="px-3 py-1.5 bg-white text-amber-600 text-xs font-bold rounded-lg border border-amber-200 hover:bg-amber-50">Deactivate</button>
                  <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-white text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-50">Delete</button>
              </div>
          </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                        {isAllSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                    </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User Profile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                {activeTab === 'pending' && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Documents</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.has(user.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                      <button onClick={() => toggleSelection(user.id)} className="text-slate-400 hover:text-indigo-600">
                        {selectedIds.has(user.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                      </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                        {user.roles.map(role => (
                            <span key={role} className={`px-2.5 py-1 inline-flex items-center text-[10px] font-bold uppercase tracking-wide rounded-full border ${getRoleColor(role)}`}>
                                <span className="mr-1.5">{getRoleIcon(role)}</span>
                                {role.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(user)}
                  </td>

                  {activeTab === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                          {(user.roles.includes(UserRole.TEACHER) || user.roles.includes(UserRole.TUTOR) || user.roles.includes(UserRole.SCHOOL_ADMIN)) ? (
                              user.verificationDocuments && user.verificationDocuments.length > 0 ? (
                                  <span className="flex items-center text-xs font-bold text-green-600">
                                      <CheckCircle className="w-4 h-4 mr-1.5" /> Uploaded
                                  </span>
                              ) : (
                                  <span className="flex items-center text-xs font-bold text-red-500">
                                      <XCircle className="w-4 h-4 mr-1.5" /> Missing
                                  </span>
                              )
                          ) : (
                              <span className="text-xs text-slate-400">-</span>
                          )}
                      </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                        onClick={() => !user.active ? handleReview(user) : handleStatusToggle(user)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border flex items-center w-fit transition-all hover:scale-105 ${
                            user.active 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                      {user.active ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {user.active ? 'Active' : 'Pending Verification'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {!user.active ? (
                          <button 
                            onClick={() => handleReview(user)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow hover:bg-indigo-700 transition-colors flex items-center"
                          >
                              Review Application
                          </button>
                      ) : (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleViewLogs(user)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                title="View Audit Logs"
                            >
                                <History className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleEdit(user)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                                title="Edit Role & Details"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(user)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete User"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Audit Logs Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div 
            className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setShowAuditLogs(!showAuditLogs)}
          >
              <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">System Audit Logs</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">{showAuditLogs ? 'Hide' : 'Show'} Recent Activity</span>
          </div>
          
          {showAuditLogs && (
              <div className="max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                  <table className="min-w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-3">Time</th>
                              <th className="px-6 py-3">Actor</th>
                              <th className="px-6 py-3">Action</th>
                              <th className="px-6 py-3">Target</th>
                              <th className="px-6 py-3">Details</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {auditLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-3 text-slate-500 text-xs flex items-center gap-2">
                                      <FileClock className="w-3 h-3" /> {log.timestamp}
                                  </td>
                                  <td className="px-6 py-3 font-medium text-slate-900">{log.actor}</td>
                                  <td className="px-6 py-3">
                                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">{log.action}</span>
                                  </td>
                                  <td className="px-6 py-3 text-slate-700">{log.target}</td>
                                  <td className="px-6 py-3 text-slate-500 text-xs italic">{log.details || '-'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {auditLogs.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-sm">No activity recorded yet.</div>
                  )}
              </div>
          )}
      </div>

      {/* APPROVAL / REVIEW MODAL */}
      {isReviewModalOpen && reviewUser && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                      <div className="flex items-center gap-3 mb-2">
                          <Shield className="w-6 h-6" />
                          <h3 className="text-xl font-bold">Review Application</h3>
                      </div>
                      <p className="text-indigo-100 text-sm">Verify applicant details before approving access.</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
                              {reviewUser.first_name[0]}
                          </div>
                          <div>
                              <h4 className="text-lg font-bold text-slate-900">{reviewUser.first_name} {reviewUser.last_name}</h4>
                              <p className="text-sm text-slate-500 mb-2">{reviewUser.email}</p>
                              <div className="flex gap-2">
                                  {reviewUser.roles.map(r => (
                                      <span key={r} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-indigo-200">
                                          {r.replace('_', ' ')}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div>
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Submitted Documents</h5>
                          
                          {reviewUser.verificationDocuments && reviewUser.verificationDocuments.length > 0 ? (
                              <div className="space-y-2">
                                  {reviewUser.verificationDocuments.map((doc, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                                          <div className="flex items-center gap-3">
                                              <div className="p-2 bg-red-50 text-red-600 rounded">
                                                  <FileText className="w-5 h-5" />
                                              </div>
                                              <div>
                                                  <p className="text-sm font-medium text-slate-900">{doc}</p>
                                                  <p className="text-xs text-slate-400">Uploaded recently</p>
                                              </div>
                                          </div>
                                          <button 
                                            onClick={() => alert(`Opening document: ${doc}`)} 
                                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 group-hover:bg-white group-hover:border-indigo-300 shadow-sm transition-all"
                                          >
                                              <Eye className="w-3.5 h-3.5" /> View
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-2" /> No documents uploaded.
                              </div>
                          )}
                          
                          {reviewUser.roles.includes(UserRole.SCHOOL_ADMIN) && (
                              <div className="mt-3">
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration Number</label>
                                  <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-sm text-slate-700">
                                      REG-PENDING-VERIFICATION
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                      <button 
                        onClick={handleRejectUser}
                        className="flex-1 py-3 border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                          <ThumbsDown className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={handleApproveUser}
                        disabled={!reviewUser.verificationDocuments?.length && !reviewUser.roles.includes(UserRole.STUDENT)}
                        className="flex-1 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={(!reviewUser.verificationDocuments?.length && !reviewUser.roles.includes(UserRole.STUDENT)) ? "Cannot approve without documents" : "Approve User"}
                      >
                          <Check className="w-4 h-4" /> Approve Application
                      </button>
                  </div>
                  <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                      <X className="w-6 h-6" />
                  </button>
              </div>
          </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{editingUser ? 'Edit User & Roles' : 'Add New User'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                  <input 
                    value={formData.first_name || ''}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                  <input 
                    value={formData.last_name || ''}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500"
                />
              </div>

              <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Status</label>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={formData.active === true} 
                            onChange={() => setFormData({...formData, active: true})}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-slate-700">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={formData.active === false} 
                            onChange={() => setFormData({...formData, active: false})}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm font-medium text-slate-700">Inactive</span>
                      </label>
                  </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Assign Roles</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {SELECTABLE_ROLES.map((role) => {
                    const isSelected = formData.roles?.includes(role);
                    return (
                        <div 
                            key={role}
                            onClick={() => handleRoleToggle(role)}
                            className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                                isSelected 
                                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 shrink-0 ${
                                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                                }`}>
                                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm font-bold capitalize ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {role.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="ml-6 mt-1 text-[10px] text-slate-500 leading-tight">
                                {ROLE_PERMISSIONS[role]?.slice(0, 2).join(', ')}
                                {ROLE_PERMISSIONS[role]?.length > 2 && '...'}
                            </div>
                        </div>
                    );
                  })}
                </div>

                {/* Granular Permissions Section */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Capabilities & Permissions</h4>
                    </div>
                    
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => (
                        <div key={category} className="mb-4 last:mb-0">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-200 pb-1">{category}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {perms.map(perm => {
                                    const inherited = isPermissionInherited(perm, formData.roles || []);
                                    const explicit = formData.customPermissions?.includes(perm);
                                    const isChecked = inherited || explicit;
                                    
                                    return (
                                        <label key={perm} className={`flex items-center p-2 rounded border text-xs cursor-pointer transition-all ${inherited ? 'bg-slate-100 border-slate-200 opacity-80 cursor-default' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                            <input 
                                                type="checkbox"
                                                checked={!!isChecked}
                                                disabled={inherited}
                                                onChange={() => {
                                                    const current = formData.customPermissions || [];
                                                    if (current.includes(perm)) {
                                                        setFormData({ ...formData, customPermissions: current.filter(p => p !== perm) });
                                                    } else {
                                                        setFormData({ ...formData, customPermissions: [...current, perm] });
                                                    }
                                                }}
                                                className={`rounded text-indigo-600 focus:ring-indigo-500 mr-2 h-3.5 w-3.5 ${inherited ? 'text-slate-400' : ''}`}
                                            />
                                            <span className={inherited ? 'text-slate-500 font-medium' : 'text-slate-700 font-medium'}>
                                                {perm} 
                                                {inherited && <span className="text-[9px] ml-1.5 text-slate-400 bg-slate-200 px-1 rounded">(Role)</span>}
                                                {explicit && <span className="text-[9px] ml-1.5 text-indigo-600 bg-indigo-50 px-1 rounded border border-indigo-100">Custom</span>}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900">Cancel</button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Specific Logs Modal */}
      {userLogsModalOpen && selectedUserForLogs && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">Audit History</h3>
                          <p className="text-xs text-slate-500">For: {selectedUserForLogs.first_name} {selectedUserForLogs.last_name}</p>
                      </div>
                      <button onClick={() => setUserLogsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0">
                      <table className="min-w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                              <tr>
                                  <th className="px-6 py-3">Time</th>
                                  <th className="px-6 py-3">Action</th>
                                  <th className="px-6 py-3">Details</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {userSpecificLogs.length === 0 ? (
                                  <tr>
                                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                                          No history found for this user.
                                      </td>
                                  </tr>
                              ) : (
                                  userSpecificLogs.map(log => (
                                      <tr key={log.id} className="hover:bg-slate-50">
                                          <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                                              {log.timestamp}
                                          </td>
                                          <td className="px-6 py-3">
                                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                                                  {log.action}
                                              </span>
                                          </td>
                                          <td className="px-6 py-3 text-slate-600 text-xs">
                                              {log.details || log.target}
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                      <button onClick={() => setUserLogsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
