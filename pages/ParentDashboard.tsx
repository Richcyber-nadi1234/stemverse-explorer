
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, TrendingUp, AlertTriangle, CheckCircle, BookOpen, Calendar, Clock, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChildren = [
  {
    id: 'c1',
    name: 'Kwame Mensah',
    grade: 'Class 5A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame',
    attendance: 96,
    avgGrade: 88,
    assignmentsPending: 2,
    recentActivity: [
        { title: 'Scored 95% in Math Quiz', date: 'Today', type: 'good' },
        { title: 'Missed Robotics Club', date: 'Yesterday', type: 'bad' }
    ],
    chartData: [
        { subject: 'Math', score: 90 },
        { subject: 'Science', score: 85 },
        { subject: 'English', score: 78 },
        { subject: 'Coding', score: 95 },
    ]
  },
  {
    id: 'c2',
    name: 'Ama Mensah',
    grade: 'Class 3B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ama',
    attendance: 100,
    avgGrade: 92,
    assignmentsPending: 0,
    recentActivity: [
        { title: 'Completed Homework: Shapes', date: '2 hours ago', type: 'good' },
        { title: 'Earned "Early Bird" Badge', date: 'Yesterday', type: 'good' }
    ],
    chartData: [
        { subject: 'Math', score: 88 },
        { subject: 'Science', score: 92 },
        { subject: 'English', score: 90 },
        { subject: 'Art', score: 98 },
    ]
  }
];

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleViewReport = (child: any) => {
      navigate('/parent/report', { state: { student: child } });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
        <p className="text-slate-500">Monitor your children's academic progress and activities.</p>
      </div>

      {/* Children Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {mockChildren.map(child => (
            <div key={child.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md">
                            <img src={child.avatar} alt={child.name} className="w-full h-full rounded-full bg-slate-100" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{child.name}</h2>
                            <p className="text-indigo-100 text-sm">{child.grade}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{child.avgGrade}%</div>
                        <div className="text-xs text-indigo-200 uppercase font-bold">Avg. Grade</div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" /> Attendance
                        </div>
                        <div className="text-xl font-bold text-slate-900">{child.attendance}%</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${child.assignmentsPending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-1">
                            <BookOpen className={`w-4 h-4 ${child.assignmentsPending > 0 ? 'text-amber-500' : 'text-green-500'}`} /> Pending Work
                        </div>
                        <div className={`text-xl font-bold ${child.assignmentsPending > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                            {child.assignmentsPending} Tasks
                        </div>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                    {/* Recent Activity Feed */}
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center text-sm">
                            <Activity className="w-4 h-4 mr-2 text-indigo-600" /> Recent Updates
                        </h3>
                        <div className="space-y-3">
                            {child.recentActivity.map((act, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.type === 'good' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{act.title}</p>
                                        <p className="text-xs text-slate-400">{act.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="flex-1 h-40">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" /> Performance
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={child.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                        onClick={() => handleViewReport(child)}
                        className="w-full py-2 text-sm font-bold text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center justify-center"
                    >
                        View Full Report <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                  <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-amber-900 text-lg">Upcoming Fees Reminder</h3>
                  <p className="text-amber-800 text-sm mt-1 max-w-2xl">
                      School fees for Term 2 are due on <strong>Friday, 25th October</strong>. Please ensure payments are made via the portal or bank transfer to avoid interruption in access.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors">
                      Pay Now
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};
