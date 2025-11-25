
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Award, TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, Download, Printer, Share2, ChevronDown, Calendar, BookOpen } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

// --- EXTENDED MOCK DATA ---
const mockStudentData = {
  name: 'Kwame Mensah',
  id: 'ADM/23/001',
  dob: '12th March, 2012',
  email: 'kwame.m@school.edu',
  class: '5A',
  attendance: 96,
  avg_grade: 88,
  position: '3rd',
  total_students: 32,
  teacher_remark: "Kwame is an exceptional student who shows great promise in STEM subjects. He needs to participate more in group history discussions.",
  badges: ['Robot Builder', 'Math Whiz', 'Perfect Week', 'Code Ninja'],
  
  // Academic Breakdown
  subjects: [
    { name: 'Mathematics', teacher: 'Mr. A. Boateng', coursework: 92, exam: 88, final: 90, class_avg: 75, grade: 'A' },
    { name: 'Integ. Science', teacher: 'Dr. K. Osei', coursework: 85, exam: 90, final: 88, class_avg: 72, grade: 'A' },
    { name: 'Computing / ICT', teacher: 'Sarah Mensah', coursework: 95, exam: 94, final: 95, class_avg: 80, grade: 'A+' },
    { name: 'English Lang.', teacher: 'Ms. J. Doe', coursework: 78, exam: 82, final: 80, class_avg: 78, grade: 'B+' },
    { name: 'Robotics (Club)', teacher: 'Dr. K. Osei', coursework: 90, exam: 95, final: 93, class_avg: 85, grade: 'A' },
  ],

  // Trend Data
  performance_trend: [
    { term: 'Term 1', student: 82, class: 70 },
    { term: 'Term 2', student: 85, class: 72 },
    { term: 'Term 3', student: 88, class: 74 },
  ],

  // Behavior Log
  behavior_log: [
    { id: 1, date: '2023-10-15', type: 'positive', title: 'Helped peer with coding', points: 5 },
    { id: 2, date: '2023-10-10', type: 'positive', title: 'Perfect Attendance Award', points: 10 },
    { id: 3, date: '2023-09-28', type: 'negative', title: 'Late to Morning Assembly', points: -2 },
  ],

  // Soft Skills
  skills: [
    { name: 'Teamwork', score: 85, fullMark: 100 },
    { name: 'Punctuality', score: 70, fullMark: 100 },
    { name: 'Creativity', score: 95, fullMark: 100 },
    { name: 'Leadership', score: 80, fullMark: 100 },
    { name: 'Communication', score: 75, fullMark: 100 },
  ]
};

export const StudentReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'behavior'>('overview');
  const [student] = useState(mockStudentData);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (format: 'PDF' | 'XLSX') => {
    // Simulate download
    const fileName = `Report_${student.name.replace(' ', '_')}_${format}.${format.toLowerCase()}`;
    alert(`Generating ${format} report: ${fileName}\n\nThis would trigger a backend generation job.`);
  };

  const GradeBadge = ({ grade }: { grade: string }) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-50 text-green-700 border-green-100',
      'B+': 'bg-blue-50 text-blue-700 border-blue-100',
      'B': 'bg-blue-50 text-blue-600 border-blue-100',
      'C': 'bg-yellow-50 text-yellow-700 border-yellow-100',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-md text-sm font-bold border ${colors[grade] || 'bg-slate-100 text-slate-600'}`}>
        {grade}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Report Card</h1>
          <p className="text-slate-500 text-sm">Academic Year 2023/2024 • Term 3</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={handlePrint}
             className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
           >
             <Printer className="w-4 h-4 mr-2" /> Print
           </button>
           <button 
             onClick={() => handleDownload('PDF')}
             className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
           >
             <Download className="w-4 h-4 mr-2" /> Download PDF
           </button>
           <button 
             onClick={() => handleDownload('XLSX')}
             className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
           >
             <FileText className="w-4 h-4 mr-2" /> Export Excel
           </button>
        </div>
      </div>

      {/* Student Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end">
              <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-2 border-indigo-50">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="ml-4 mb-1">
                <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
                <p className="text-slate-500 font-medium">{student.id} • Class {student.class}</p>
              </div>
            </div>
            <div className="hidden sm:block text-right mb-1">
              <div className="text-sm text-slate-500">Class Position</div>
              <div className="text-2xl font-bold text-indigo-600">{student.position} <span className="text-sm text-slate-400 font-normal">/ {student.total_students}</span></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Avg. Grade</p>
                 <p className="text-lg font-bold text-slate-900">{student.avg_grade}%</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Attendance</p>
                 <p className="text-lg font-bold text-slate-900">{student.attendance}%</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Badges</p>
                 <p className="text-lg font-bold text-slate-900">{student.badges.length}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Conduct</p>
                 <p className="text-lg font-bold text-slate-900">Excellent</p>
               </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 mt-4 overflow-x-auto print:hidden">
            {['overview', 'academics', 'behavior'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT AREAS */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" /> Performance History
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={student.performance_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="student" name="Student Avg" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="class" name="Class Avg" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Soft Skills Radar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="font-bold text-slate-900 mb-2 w-full text-left">Soft Skills Analysis</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={student.skills}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Skills"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 w-full">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Teacher's General Remark</h4>
              <p className="text-sm text-slate-700 italic">"{student.teacher_remark}"</p>
              <div className="mt-3 text-xs font-medium text-slate-900">— Mrs. Mensah (Form Tutor)</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACADEMICS TAB */}
      {activeTab === 'academics' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Visual Comparison */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Subject Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={student.subjects}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="final" name="Student Grade" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="class_avg" name="Class Avg" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Detailed Table */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-900">Detailed Breakdown</h3>
               <div className="text-sm text-slate-500 flex gap-4">
                 <div className="flex items-center"><span className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded-full mr-2"></span> Above Class Avg</div>
                 <div className="flex items-center"><span className="w-3 h-3 bg-red-50 border border-red-200 rounded-full mr-2"></span> Below Class Avg</div>
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-white">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Coursework (30%)</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Exam (70%)</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Class Avg</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-100">
                   {student.subjects.map((subject, index) => (
                     <tr key={index} className={`hover:bg-slate-50 transition-colors ${subject.final < subject.class_avg ? 'bg-red-50/30' : ''}`}>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-bold text-slate-900">{subject.name}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-slate-500">{subject.teacher}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">
                         {subject.coursework}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">
                         {subject.exam}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <div className="text-sm font-bold text-indigo-900">{subject.final}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">
                         {subject.class_avg}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <GradeBadge grade={subject.grade} />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-center text-slate-500">
               Grading Scale: A+ (95-100) | A (85-94) | B+ (80-84) | B (70-79) | C (60-69) | D (50-59) | F (0-49)
             </div>
          </div>
        </div>
      )}

      {/* 3. BEHAVIOR TAB */}
      {activeTab === 'behavior' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Timeline */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-6">Behavior Log</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                 {student.behavior_log.map(log => (
                   <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${
                        log.type === 'positive' 
                        ? 'bg-green-100 border-green-200 text-green-600' 
                        : 'bg-red-100 border-red-200 text-red-600'
                      }`}>
                        {log.type === 'positive' ? <Award className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                         <div className="flex justify-between items-start mb-1">
                           <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.type === 'positive' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                             {log.type === 'positive' ? 'Merit' : 'Sanction'}
                           </span>
                           <span className="text-xs text-slate-400">{log.date}</span>
                         </div>
                         <h4 className="font-bold text-slate-800 text-sm">{log.title}</h4>
                         <p className={`text-xs font-medium mt-1 ${log.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                           {log.type === 'positive' ? '+' : ''}{log.points} Points
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Badges & Achievements */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-6">Earned Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {student.badges.map((badge, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group cursor-default">
                       <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                          {['🏆', '⭐', '🚀', '💻'][i % 4]}
                       </div>
                       <span className="text-sm font-medium text-slate-700 text-center">{badge}</span>
                       <span className="text-xs text-slate-400 mt-1">Earned Oct '23</span>
                    </div>
                 ))}
                 <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <span className="text-xl">+</span>
                    </div>
                    <span className="text-xs font-medium">View All Available</span>
                 </button>
              </div>
           </div>
      </div>
      )}
    </div>
  );
};
