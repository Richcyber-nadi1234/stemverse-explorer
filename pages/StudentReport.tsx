
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Award, TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, Download, Printer, Share2, ChevronDown, Calendar, BookOpen, Search, Filter, ArrowLeft, Eye, Users, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell 
} from 'recharts';
import { ToastContext } from '../contexts/ToastContext';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';

// --- MOCK DATA ---
const mockClassStudents = [
  { id: '1', name: 'Kwame Mensah', student_id: 'ADM/23/001', class: '5A', avg_grade: 88, attendance: 96, status: 'Excellent', avatar: 'K' },
  { id: '2', name: 'Ama Osei', student_id: 'ADM/23/002', class: '5A', avg_grade: 92, attendance: 98, status: 'Excellent', avatar: 'A' },
  { id: '3', name: 'Kofi Annan', student_id: 'ADM/23/003', class: '5B', avg_grade: 75, attendance: 85, status: 'Average', avatar: 'K' },
  { id: '4', name: 'Sarah Smith', student_id: 'ADM/23/004', class: '5A', avg_grade: 65, attendance: 78, status: 'Needs Support', avatar: 'S' },
  { id: '5', name: 'John Doe', student_id: 'ADM/23/005', class: '5B', avg_grade: 82, attendance: 90, status: 'Good', avatar: 'J' },
  { id: '6', name: 'Esi Mansah', student_id: 'ADM/23/006', class: '5A', avg_grade: 70, attendance: 82, status: 'Average', avatar: 'E' },
];

const baseStudentData = {
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

  // Activity Log
  activity_log: [
    { id: 'a1', timestamp: '2023-10-14 08:12 AM', category: 'Login', action: 'Logged into STEMverse', details: 'Web app' },
    { id: 'a2', timestamp: '2023-10-14 08:20 AM', category: 'Course', action: 'Started Lesson', details: 'Computing / ICT • Variables and Data Types' },
    { id: 'a3', timestamp: '2023-10-14 08:45 AM', category: 'Course', action: 'Completed Lesson', details: 'Robotics • Sensors Overview' },
    { id: 'a4', timestamp: '2023-10-14 09:15 AM', category: 'Assessment', action: 'Submitted Quiz', details: 'Mathematics • Fractions Quiz 2' },
    { id: 'a5', timestamp: '2023-10-14 10:05 AM', category: 'Project', action: 'Updated Project Task', details: 'Robotics Club • Calibrated sensor module' },
    { id: 'a6', timestamp: '2023-10-14 11:30 AM', category: 'Marketplace', action: 'Redeemed Coins', details: 'Purchased avatar accessory' },
    { id: 'a7', timestamp: '2023-10-14 12:10 PM', category: 'Exam', action: 'Submitted Exam', details: 'Integ. Science • Term 3 Exam' },
    { id: 'a8', timestamp: '2023-10-14 12:30 PM', category: 'Share', action: 'Shared Report', details: 'Exported PDF to parent email' },
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
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isInstructor = user?.roles.some(r => [UserRole.TEACHER, UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TUTOR].includes(r));

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'behavior'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'report'>(location.state?.student ? 'report' : (isInstructor ? 'list' : 'report'));
  
  // List View State
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');

  // Selected Student Data
  const [student, setStudent] = useState<any>(() => {
      if (location.state?.student) {
          // Merge passed state with base mock data structure to ensure charts work
          const s = location.state.student;
          return {
              ...baseStudentData,
              name: s.name,
              id: s.id || baseStudentData.id,
              class: s.grade?.replace('Class ', '') || '5A',
              attendance: s.attendance || 90,
              avg_grade: s.avgGrade || 85,
          };
      }
      return baseStudentData;
  });

  const handlePrint = () => {
    showToast('Preparing document for printing...', 'info');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = (format: 'PDF' | 'XLSX') => {
    showToast(`Generating ${format} report...`, 'info');
    setTimeout(() => {
        showToast(`${format} download started`, 'success');
    }, 1500);
  };

  const handlePrintForStudent = (studentSummary: any) => {
    showToast('Preparing student report for printing...', 'info');
    handleViewStudent(studentSummary);
    setTimeout(() => handlePrint(), 600);
  };

  const handleViewStudent = (studentSummary: any) => {
      // Simulate fetching detailed data
      const detailedData = {
          ...baseStudentData,
          name: studentSummary.name,
          id: studentSummary.student_id,
          class: studentSummary.class,
          avg_grade: studentSummary.avg_grade,
          attendance: studentSummary.attendance,
          // Randomize chart data slightly for effect
          performance_trend: baseStudentData.performance_trend.map(d => ({
              ...d, 
              student: d.student + (Math.random() * 10 - 5)
          }))
      };
      setStudent(detailedData);
      setViewMode('report');
      window.scrollTo(0, 0);
  };

  const filteredStudents = mockClassStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'All' || s.class === classFilter;
      return matchesSearch && matchesClass;
  });

  // Analytics for List View
  const classAverage = Math.round(mockClassStudents.reduce((acc, curr) => acc + curr.avg_grade, 0) / mockClassStudents.length);
  const attendanceAvg = Math.round(mockClassStudents.reduce((acc, curr) => acc + curr.attendance, 0) / mockClassStudents.length);
  const statusDistribution = [
    { name: 'Excellent', value: mockClassStudents.filter(s => s.status === 'Excellent').length, fill: '#22c55e' },
    { name: 'Good', value: mockClassStudents.filter(s => s.status === 'Good').length, fill: '#3b82f6' },
    { name: 'Average', value: mockClassStudents.filter(s => s.status === 'Average').length, fill: '#eab308' },
    { name: 'Needs Support', value: mockClassStudents.filter(s => s.status === 'Needs Support').length, fill: '#ef4444' },
  ].filter(d => d.value > 0);

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

  // --- STUDENT LIST VIEW (For Instructors) ---
  if (viewMode === 'list') {
      return (
          <div className="space-y-6 max-w-7xl mx-auto pb-12">
              <div>
                  <h1 className="text-2xl font-bold text-slate-900">Student Reports & Analytics</h1>
                  <p className="text-slate-500">Overview of class performance, attendance, and individual progress.</p>
              </div>

              {/* Class Aggregate Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                          <Users className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Total Students</p>
                          <p className="text-2xl font-bold text-slate-900">{mockClassStudents.length}</p>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-green-100 text-green-600 rounded-full">
                          <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Class Average</p>
                          <p className="text-2xl font-bold text-slate-900">{classAverage}%</p>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                          <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Avg Attendance</p>
                          <p className="text-2xl font-bold text-slate-900">{attendanceAvg}%</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Status Distribution Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                          <PieChartIcon className="w-4 h-4 mr-2 text-indigo-600" /> Performance Status
                      </h3>
                      <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={statusDistribution}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={40}
                                      outerRadius={70}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {statusDistribution.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                      ))}
                                  </Pie>
                                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Filters & Table */}
                  <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                          <div className="flex gap-4 w-full sm:w-auto">
                              <div className="relative flex-1 sm:w-64">
                                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input 
                                      type="text" 
                                      placeholder="Search student..." 
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <select 
                                  value={classFilter}
                                  onChange={(e) => setClassFilter(e.target.value)}
                                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                              >
                                  <option value="All">All Classes</option>
                                  <option value="5A">Class 5A</option>
                                  <option value="5B">Class 5B</option>
                              </select>
                          </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                  <tr>
                                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Grade</th>
                                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-slate-200">
                                  {filteredStudents.length === 0 ? (
                                      <tr>
                                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                              No students found matching your filters.
                                          </td>
                                      </tr>
                                  ) : filteredStudents.map((s) => (
                                      <tr key={s.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleViewStudent(s)}>
                                          <td className="px-6 py-4 whitespace-normal md:whitespace-nowrap">
                                              <div className="flex items-center">
                                                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 border border-indigo-200 text-sm">
                                                      {s.avatar}
                                                  </div>
                                                  <div>
                                                      <div className="text-sm font-bold text-slate-900">{s.name}</div>
                                                      <div className="text-xs text-slate-500">{s.student_id}</div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-normal md:whitespace-nowrap">
                                              <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{s.class}</span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-normal md:whitespace-nowrap">
                                              <div className="text-sm font-bold text-slate-900">{s.avg_grade}%</div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-normal md:whitespace-nowrap">
                                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                  ${s.status === 'Excellent' ? 'bg-green-100 text-green-800' : 
                                                    s.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                                                    s.status === 'Average' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-red-100 text-red-800'}`}>
                                                  {s.status}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                              <div className="flex items-center justify-end gap-2">
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); handleViewStudent(s); }}
                                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center"
                                                >
                                                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                </button>
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); handlePrintForStudent(s); }}
                                                  className="text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center"
                                                >
                                                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                                                </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- REPORT VIEW (For Parents & Instructors viewing a single student) ---
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Navigation for Instructors */}
      {isInstructor && (
          <button 
            onClick={() => setViewMode('list')}
            className="flex items-center text-slate-500 hover:text-slate-900 font-medium mb-2 transition-colors hover:translate-x-1"
          >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Student List
          </button>
      )}

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
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-2 border-indigo-50 overflow-hidden">
                  {/* Try to show avatar image if available from parent dash props, else initials */}
                  {student.name.split(' ').map((n: string) => n[0]).join('')}
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
          {/* Activity Timeline */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" /> Activity Timeline
            </h3>
            <div className="space-y-4">
              {student.activity_log.map((log: any) => (
                <div key={log.id} className="flex items-start justify-between border border-slate-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      {log.category === 'Course' ? <BookOpen className="w-4 h-4" />
                        : log.category === 'Assessment' ? <FileText className="w-4 h-4" />
                        : log.category === 'Exam' ? <FileText className="w-4 h-4" />
                        : log.category === 'Project' ? <Users className="w-4 h-4" />
                        : log.category === 'Marketplace' ? <Download className="w-4 h-4" />
                        : log.category === 'Share' ? <Share2 className="w-4 h-4" />
                        : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{log.action}</div>
                      <div className="text-xs text-slate-600">{log.details}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {log.timestamp}
                  </div>
                </div>
              ))}
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
                   {student.subjects.map((subject: any, index: number) => (
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
                 {student.behavior_log.map((log: any) => (
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
                 {student.badges.map((badge: string, i: number) => (
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
