
import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Settings, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Notification, NotificationPreferences } from '../types';

const mockNotifications: Notification[] = [
  { id: '1', title: 'Exam Scheduled', message: 'Mathematics Mid-Term has been scheduled for Oct 15th.', type: 'info', read: false, created_at: '2023-10-10T09:00:00Z' },
  { id: '2', title: 'Results Published', message: 'Science Final Assessment results are now available.', type: 'success', read: true, created_at: '2023-10-09T14:30:00Z' },
  { id: '3', title: 'System Maintenance', message: 'Scheduled maintenance on Sunday at 2 AM.', type: 'warning', read: false, created_at: '2023-10-08T10:00:00Z' },
  { id: '4', title: 'Payment Failed', message: 'Subscription renewal failed for Student #882.', type: 'error', read: true, created_at: '2023-10-01T11:00:00Z' },
];

const initialPreferences: NotificationPreferences = {
  exam_alerts: { email: true, sms: true, in_app: true },
  results_published: { email: true, sms: false, in_app: true },
  course_announcements: { email: true, sms: false, in_app: true },
  assignment_deadlines: { email: true, sms: true, in_app: true },
  marketing: { email: false, sms: false, in_app: false },
  system_updates: { email: true, sms: false, in_app: true },
};

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences'>('inbox');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const togglePreference = (category: keyof NotificationPreferences, channel: 'email' | 'sms' | 'in_app') => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500">Manage your alerts and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
              activeTab === 'inbox'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Inbox
            {notifications.some(n => !n.read) && (
              <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inbox' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No notifications.</div>
            ) : notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 flex gap-4 transition-colors ${notification.read ? 'bg-white' : 'bg-indigo-50/30'}`}
              >
                <div className="mt-1">
                    <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-semibold ${notification.read ? 'text-slate-900' : 'text-indigo-900'}`}>
                        {notification.title}
                    </h4>
                    <span className="text-xs text-slate-400">
                        {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${notification.read ? 'text-slate-600' : 'text-slate-800'}`}>
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                    {!notification.read && (
                        <button 
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-6">Notification Channels</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-1/2">Notification Type</th>
                            <th className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                    <Bell className="w-5 h-5 mb-1" />
                                    <span>In-App</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                    <Mail className="w-5 h-5 mb-1" />
                                    <span>Email</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                    <MessageSquare className="w-5 h-5 mb-1" />
                                    <span>SMS</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(Object.keys(preferences) as Array<keyof NotificationPreferences>).map((key) => (
                            <tr key={key} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                                    {key.replace('_', ' ')}
                                </td>
                                {(['in_app', 'email', 'sms'] as const).map((channel) => (
                                    <td key={channel} className="px-6 py-4 text-center">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={preferences[key][channel]}
                                                onChange={() => togglePreference(key, channel)}
                                                className="sr-only peer"
                                            />
                                            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
      )}
    </div>
  );
};