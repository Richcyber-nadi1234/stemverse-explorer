
import React, { useState, useMemo } from 'react';
import { User, UserRole, AuditLogEntry } from '../types';
import { Search, Filter, Edit, Trash2, Shield, UserPlus, CheckCircle, AlertCircle, Mail, Save, X, Lock, CheckSquare, Square, Power, History, FileClock, XCircle, Eye } from 'lucide-react';

// Mock Data for Users
const mockUsers: User[] = [
  { id: 'u1', first_name: 'Admin', last_name: 'User', email: 'admin@stemverse.com', roles: [UserRole.ADMIN], level: 10, coins: 0, xp: 0, active: true },
  { id: 'u2', first_name: 'Sarah', last_name: 'Mensah', email: 'sarah@school.edu', roles: [UserRole.STUDENT], level: 5, coins: 450, xp: 1200, active: true },
  { id: 'u3', first_name: 'Dr. K.', last_name: 'Osei', email: 'osei@school.edu', roles: [UserRole.TEACHER, UserRole.SCHOOL_ADMIN], level: 0, coins: 0, xp: 0, active: true },
  { id: 'u4', first_name: 'John', last_name: 'Doe', email: 'john@tutor.com', roles: [UserRole.TUTOR], level: 0, coins: 0, xp: 0, active: false },
  { id: 'u5', first_name: 'Jane', last_name: 'Smith', email: 'jane@parent.com', roles: [UserRole.PARENT], level: 0, coins: 0, xp: 0, active: true },
  { id: 'u6', first_name: 'Kwame', last_name: 'Appiah', email: 'kwame.admin@school.edu', roles: [UserRole.SCHOOL_ADMIN], level: 0, coins: 0, xp: 0, active: true },
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

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  
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

  // --- FILTERING ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'All' || user.roles.includes(filterRole as UserRole);
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

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
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      roles: [UserRole.STUDENT],
      active: true
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
      if (addedRoles.length) changeDetails += `Added: ${addedRoles.join(', ')}. `;
      if (removedRoles.length) changeDetails += `Removed: ${removedRoles.join(', ')}. `;
      if (!changeDetails) changeDetails = 'Profile details updated.';

      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
      logAction('User Updated', `${formData.first_name} ${formData.last_name}`, changeDetails);
      showNotification('success', `User updated successfully.`);
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        xp: 0, coins: 0, level: 1, streak: 0,
        active: true,
        ...formData as User
      };
      setUsers(prev => [newUser, ...prev]);
      logAction('User Created', `${formData.first_name} ${formData.last_name}`, `Initial Role: ${formData.roles?.join(', ')}`);
      showNotification('success', 'New user created successfully.');
    }
    setIsModalOpen(false);
  };

  // Compute Permissions for Preview
  const activePermissions = useMemo(() => {
      const roles = formData.roles || [];
      const perms = new Set<string>();
      roles.forEach(role => {
          ROLE_PERMISSIONS[role]?.forEach(p => perms.add(p));
      });
      return Array.from(perms);
  }, [formData.roles]);

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
          <p className="text-slate-500">Manage accounts, roles, permissions, and audit logs.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Roles</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
                    <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                            <span key={role} className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wide rounded-full border ${getRoleColor(role)}`}>
                                {role.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                        onClick={() => handleStatusToggle(user)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border flex items-center w-fit transition-all hover:scale-105 ${
                            user.active 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                    >
                      {user.active ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                  <input 
                    value={formData.last_name || ''}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  {Object.values(UserRole).map((role) => {
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

                {/* Permissions Preview */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Resulting Permissions</h4>
                    </div>
                    {activePermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {activePermissions.map(p => (
                                <span key={p} className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shadow-sm">
                                    {p}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Select roles to view granted permissions.</p>
                    )}
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
