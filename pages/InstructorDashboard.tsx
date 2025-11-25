
import React from 'react';
import { Users, BookOpen, Clock, TrendingUp, Plus, ArrowRight, Star, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Robotics 101', students: 45, engagement: 88 },
  { name: 'Python Basics', students: 62, engagement: 75 },
  { name: 'Scratch Games', students: 38, engagement: 92 },
  { name: 'Adv. Math', students: 25, engagement: 65 },
];

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: 'Total Students', value: '170', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Courses', value: '4', icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Pending Grading', value: '12', icon: Clock, color: 'bg-amber-500' },
    { label: 'Avg. Rating', value: '4.8', icon: Star, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
          <p className="text-slate-500">Overview of your courses, students, and tasks.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/instructor/projects')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium flex items-center shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Project Board
          </button>
          <button 
            onClick={() => navigate('/studio')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Engagement Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Student Engagement by Course</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="engagement" fill="#6366f1" radius={[4, 4, 0, 0]} name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Tasks / Grading */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Tasks</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {[
              { title: 'Grade "Robot Logic" Quiz', course: 'Robotics 101', due: 'Today', type: 'grading' },
              { title: 'Review Project Proposals', course: 'Python Basics', due: 'Tomorrow', type: 'review' },
              { title: 'Upload Lecture 4', course: 'Scratch Games', due: 'Fri', type: 'content' },
              { title: 'Student Meeting: Kwame', course: 'Mentorship', due: 'Mon', type: 'meeting' },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">{task.title}</h4>
                  <p className="text-xs text-slate-500">{task.course} • <span className="text-orange-600">{task.due}</span></p>
                </div>
                <button onClick={() => navigate('/grading')} className="p-2 text-slate-400 hover:text-indigo-600">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/instructor/projects')} className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg text-sm hover:bg-indigo-100 transition-colors">
            View All Projects
          </button>
        </div>
      </div>
    </div>
  );
};
