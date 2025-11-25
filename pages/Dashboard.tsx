import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Jan', retention: 85, completion: 40 },
  { name: 'Feb', retention: 88, completion: 45 },
  { name: 'Mar', retention: 87, completion: 55 },
  { name: 'Apr', retention: 90, completion: 60 },
  { name: 'May', retention: 92, completion: 75 },
  { name: 'Jun', retention: 95, completion: 80 },
];

const kpiData = [
  { label: 'Active Students', value: '1,234', change: 12, icon: Users, color: 'bg-blue-500' },
  { label: 'Course Completion', value: '78%', change: 5.4, icon: BookOpen, color: 'bg-green-500' },
  { label: 'Avg. Exam Score', value: '82/100', change: -2.1, icon: Award, color: 'bg-amber-500' },
  { label: 'Revenue (YTD)', value: '$45,200', change: 18, icon: TrendingUp, color: 'bg-indigo-500' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back, here is what's happening in your school today.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {kpi.change >= 0 ? '+' : ''}{kpi.change}%
              </span>
              <span className="text-slate-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Student Retention & Engagement</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="retention" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} name="Retention %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Course Completion Rates</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completion" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Recent Audit Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { actor: 'Admin User', action: 'Generated Report', target: 'Term 3 Summary', time: '10 mins ago' },
                { actor: 'John Teacher', action: 'Created Exam', target: 'Math Final', time: '1 hour ago' },
                { actor: 'Sarah Student', action: 'Submitted Attempt', target: 'Science Quiz', time: '2 hours ago' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{log.actor}</td>
                  <td className="px-6 py-4 text-slate-600">{log.action}</td>
                  <td className="px-6 py-4 text-slate-600">{log.target}</td>
                  <td className="px-6 py-4 text-slate-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};