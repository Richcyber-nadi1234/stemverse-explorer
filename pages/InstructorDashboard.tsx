
import React from 'react';
import { Users, BookOpen, Clock, TrendingUp, Plus, ArrowRight, Star, Calendar, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend, ComposedChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---

const activityData = [
  { day: 'Mon', active: 45, submissions: 12 },
  { day: 'Tue', active: 52, submissions: 18 },
  { day: 'Wed', active: 48, submissions: 15 },
  { day: 'Thu', active: 60, submissions: 25 },
  { day: 'Fri', active: 55, submissions: 20 },
  { day: 'Sat', active: 30, submissions: 8 },
  { day: 'Sun', active: 25, submissions: 5 },
];

const gradeDistribution = [
  { name: 'A (Excellent)', value: 35, color: '#10b981' }, // Emerald
  { name: 'B (Good)', value: 45, color: '#6366f1' },     // Indigo
  { name: 'C (Average)', value: 15, color: '#f59e0b' },  // Amber
  { name: 'Needs Help', value: 5, color: '#ef4444' },    // Red
];

const coursePerformance = [
  { name: 'Robotics 101', avgScore: 85, engagement: 92 },
  { name: 'Python Basics', avgScore: 72, engagement: 65 },
  { name: 'Scratch Games', avgScore: 90, engagement: 88 },
  { name: 'Adv. Math', avgScore: 68, engagement: 55 },
];

const studentProgress = [
  { name: 'Robotics', notStarted: 5, inProgress: 25, completed: 15 },
  { name: 'Python', notStarted: 10, inProgress: 40, completed: 12 },
  { name: 'Scratch', notStarted: 2, inProgress: 10, completed: 26 },
  { name: 'Math', notStarted: 8, inProgress: 12, completed: 5 },
];

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: 'Total Students', value: '170', change: '+12%', icon: Users, color: 'bg-blue-500', trend: 'up' },
    { label: 'Active Courses', value: '4', change: '0%', icon: BookOpen, color: 'bg-indigo-500', trend: 'neutral' },
    { label: 'Pending Grading', value: '12', change: '+4', icon: Clock, color: 'bg-amber-500', trend: 'down' }, // down is bad for pending tasks context, but usually up
    { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: Star, color: 'bg-green-500', trend: 'up' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
          <p className="text-slate-500">Monitor student progress, engagement, and course performance.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/instructor/student-report')}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium flex items-center justify-center shadow-sm transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Student Reports
          </button>
          <button 
            onClick={() => navigate('/instructor/projects')}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium flex items-center justify-center shadow-sm transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Project Board
          </button>
          <button 
            onClick={() => navigate('/studio')}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.color} bg-opacity-10`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium">
              <span className={`px-2 py-0.5 rounded-full ${kpi.trend === 'up' ? 'bg-green-50 text-green-700' : kpi.trend === 'down' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
                {kpi.change}
              </span>
              <span className="text-slate-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Activity & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" /> Weekly Activity
            </h3>
            <select className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1 text-slate-500 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Area type="monotone" dataKey="active" name="Active Students" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="submissions" name="Task Submissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Overall Performance</h3>
          <p className="text-xs text-slate-500 mb-6">Grade distribution across all your active courses.</p>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-slate-900">B</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Avg Grade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Detailed Course Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement vs Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Course Performance Matrix</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#6366f1" axisLine={false} tickLine={false} tick={{ fill: '#6366f1', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" axisLine={false} tickLine={false} tick={{ fill: '#f59e0b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="engagement" name="Engagement %" fill="#6366f1" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Avg Score" stroke="#f59e0b" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Progress Stacked Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Student Progress Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentProgress} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} iconType="circle" />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#3b82f6" />
                <Bar dataKey="notStarted" name="Not Started" stackId="a" fill="#cbd5e1" radius={[4, 0, 0, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Pending Actions</h3>
          <button className="text-indigo-600 text-sm font-bold hover:underline">View All Tasks</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Grade "Robot Logic" Quiz', course: 'Robotics 101', due: 'Today', type: 'grading' },
            { title: 'Review Project Proposals', course: 'Python Basics', due: 'Tomorrow', type: 'review' },
            { title: 'Upload Lecture 4', course: 'Scratch Games', due: 'Fri', type: 'content' },
            { title: 'Resolve Student Query', course: 'Adv. Math', due: '2h ago', type: 'support' },
            { title: 'Approve New Enrollments', course: 'General', due: 'Today', type: 'admin' },
            { title: 'Weekly Report Analysis', course: 'System', due: 'Mon', type: 'report' },
          ].map((task, i) => (
            <div key={i} className="flex items-start p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group bg-slate-50/50 hover:bg-white">
              <div className={`p-2 rounded-lg mr-3 shrink-0 ${
                task.type === 'grading' ? 'bg-amber-100 text-amber-600' : 
                task.type === 'review' ? 'bg-purple-100 text-purple-600' :
                task.type === 'content' ? 'bg-blue-100 text-blue-600' :
                task.type === 'support' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
              }`}>
                {task.type === 'grading' ? <CheckCircle className="w-4 h-4" /> : 
                 task.type === 'support' ? <AlertTriangle className="w-4 h-4" /> :
                 <Clock className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{task.course}</p>
              </div>
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors whitespace-nowrap ml-2">
                {task.due}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
