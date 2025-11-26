
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Trophy, Zap, Star, Calendar, PlayCircle, Target, Award, Brain, BarChart2, Clock, CheckCircle, Medal, ArrowRight, Lock, Video, TrendingUp, BookOpen, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { RoadmapItem } from '../types';

const mockRoadmap: RoadmapItem[] = [
    { id: 'r1', title: 'Intro to Robotics', description: 'Basics of circuits and sensors', status: 'completed', type: 'course' },
    { id: 'r2', title: 'Python Logic', description: 'Loops and conditionals', status: 'current', type: 'course', recommended_reason: 'Recommended based on Logic Quiz (65%)' },
    { id: 'r3', title: 'Build a Bot', description: 'Final project submission', status: 'locked', type: 'project' },
    { id: 'r4', title: 'Advanced AI', description: 'Neural networks intro', status: 'locked', type: 'course' },
];

const currentCourses = [
  {
    id: 'c1',
    title: 'Python for Kids',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=400',
    progress: 65,
    nextLesson: 'Understanding Loops',
    totalLessons: 15,
    completedLessons: 9,
    color: 'bg-blue-500'
  },
  {
    id: 'c2',
    title: 'Robotics Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400',
    progress: 30,
    nextLesson: 'Sensors & Motors',
    totalLessons: 12,
    completedLessons: 4,
    color: 'bg-indigo-500'
  }
];

const recentActivity = [
  { id: 1, type: 'lesson', title: 'Completed "Variables"', time: '2 hours ago', xp: 50 },
  { id: 2, type: 'quiz', title: 'Scored 90% in Logic Quiz', time: 'Yesterday', xp: 100 },
  { id: 3, type: 'badge', title: 'Earned "Code Ninja"', time: '2 days ago', xp: 0 },
];

const upcomingDeadlines = [
    { title: 'Math Mid-Term', time: 'Tomorrow, 2:00 PM', type: 'exam' },
    { title: 'Python Project', time: 'Friday, 11:59 PM', type: 'assignment' },
    { title: 'Physics Lab Report', time: 'Mon, 9:00 AM', type: 'assignment' },
];

// Centralized Analytics Data based on Time Range
const analyticsData = {
    week: {
        xp: [
            { name: 'Mon', xp: 120 }, { name: 'Tue', xp: 150 }, { name: 'Wed', xp: 100 },
            { name: 'Thu', xp: 200 }, { name: 'Fri', xp: 180 }, { name: 'Sat', xp: 50 }, { name: 'Sun', xp: 220 },
        ],
        skills: [
            { subject: 'Logic', proficiency: 60, classAverage: 55, fullMark: 100 },
            { subject: 'Circuits', proficiency: 70, classAverage: 60, fullMark: 100 },
            { subject: 'Calculus', proficiency: 40, classAverage: 45, fullMark: 100 },
            { subject: 'Algorithms', proficiency: 50, classAverage: 50, fullMark: 100 },
            { subject: 'Design', proficiency: 65, classAverage: 70, fullMark: 100 },
            { subject: 'Physics', proficiency: 55, classAverage: 60, fullMark: 100 },
        ],
        progress: [
            { name: 'Robotics', student: 15, average: 10 },
            { name: 'Python', student: 10, average: 12 },
            { name: 'Scratch', student: 5, average: 8 },
        ]
    },
    month: {
        xp: [
            { name: 'Week 1', xp: 450 }, { name: 'Week 2', xp: 620 }, { name: 'Week 3', xp: 580 }, { name: 'Week 4', xp: 750 },
        ],
        skills: [
            { subject: 'Logic', proficiency: 75, classAverage: 65, fullMark: 100 },
            { subject: 'Circuits', proficiency: 85, classAverage: 70, fullMark: 100 },
            { subject: 'Calculus', proficiency: 55, classAverage: 50, fullMark: 100 },
            { subject: 'Algorithms', proficiency: 65, classAverage: 60, fullMark: 100 },
            { subject: 'Design', proficiency: 75, classAverage: 72, fullMark: 100 },
            { subject: 'Physics', proficiency: 68, classAverage: 65, fullMark: 100 },
        ],
        progress: [
            { name: 'Robotics', student: 45, average: 30 },
            { name: 'Python', student: 30, average: 35 },
            { name: 'Scratch', student: 25, average: 20 },
        ]
    },
    term: {
        xp: [
            { name: 'Jan', xp: 1800 }, { name: 'Feb', xp: 2100 }, { name: 'Mar', xp: 2400 },
        ],
        skills: [
            { subject: 'Logic', proficiency: 90, classAverage: 80, fullMark: 100 },
            { subject: 'Circuits', proficiency: 95, classAverage: 85, fullMark: 100 },
            { subject: 'Calculus', proficiency: 75, classAverage: 70, fullMark: 100 },
            { subject: 'Algorithms', proficiency: 85, classAverage: 75, fullMark: 100 },
            { subject: 'Design', proficiency: 88, classAverage: 80, fullMark: 100 },
            { subject: 'Physics', proficiency: 82, classAverage: 78, fullMark: 100 },
        ],
        progress: [
            { name: 'Robotics', student: 85, average: 70 },
            { name: 'Python', student: 60, average: 65 },
            { name: 'Scratch', student: 90, average: 80 },
        ]
    }
};

export const StudentDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term'>('week');

    if (!user) return null;

    // Mock Level Calculation
    const currentLevel = user.level || 1;
    const currentXP = user.xp || 0;
    const xpToNextLevel = 2000; // Mock threshold
    const xpProgress = (currentXP / xpToNextLevel) * 100;

    const currentData = analyticsData[timeRange];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
            {/* Gamification Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto text-center sm:text-left">
                        {/* Level Circle */}
                        <div className="relative shrink-0 group cursor-pointer transition-transform hover:scale-105">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner relative mx-auto sm:mx-0">
                                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
                                {/* Circular Progress Border */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                                    <circle 
                                        cx="50" cy="50" r="48" 
                                        fill="none" 
                                        stroke="#fbbf24" 
                                        strokeWidth="4" 
                                        strokeDasharray={`${xpProgress * 3}, 300`}
                                        strokeLinecap="round"
                                        className="drop-shadow-md"
                                    />
                                </svg>
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs sm:text-sm font-extrabold px-3 py-1 sm:px-4 rounded-full border-2 border-indigo-900 shadow-lg whitespace-nowrap">
                                Level {currentLevel}
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight">Hi, {user.first_name}!</h1>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-indigo-100 text-xs sm:text-sm mb-4">
                                <div className="flex items-center bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2 shadow-[0_0_8px_#4ade80]"></span>
                                    {user.streak || 0} Day Streak
                                </div>
                                <span className="opacity-70 hidden sm:inline">•</span>
                                <span className="font-medium">{xpToNextLevel - currentXP} XP to Level {currentLevel + 1}</span>
                            </div>

                            {/* Stat Pills */}
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-2 sm:px-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" /> {user.xp || 0} XP
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-2 sm:px-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-300" /> {user.coins || 0} Coins
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-2 sm:px-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                                    <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-purple-300" /> {(user.badges || []).length} Badges
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button onClick={() => navigate('/marketplace')} className="bg-white/10 backdrop-blur-md text-white px-6 py-3.5 rounded-xl font-bold text-sm border border-white/20 hover:bg-white hover:text-indigo-600 transition-all shadow-lg flex justify-center items-center gap-2">
                            Redeem Rewards
                        </button>
                        <button onClick={() => navigate('/lms')} className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                            <PlayCircle className="w-5 h-5" /> Resume Learning
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* My Active Courses Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-600" /> My Active Courses
                            </h2>
                            <button onClick={() => navigate('/lms')} className="text-sm font-bold text-indigo-600 hover:underline flex items-center">
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {currentCourses.map(course => {
                                const radius = 18;
                                const circumference = 2 * Math.PI * radius;
                                const offset = circumference - (course.progress / 100) * circumference;
                                return (
                                    <div key={course.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all flex gap-4 items-center group cursor-pointer" onClick={() => navigate(`/lms/course/${course.id}`)}>
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle className="w-8 h-8 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 mb-1 truncate text-sm sm:text-base">{course.title}</h3>
                                            <p className="text-xs text-slate-500 mb-2 truncate">Next: {course.nextLesson}</p>
                                            
                                            {/* Enhanced Visual Progress Indicator */}
                                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                                <span className="text-slate-700 flex items-center"><Activity className="w-3 h-3 mr-1 text-indigo-500" /> {course.progress}% Complete</span>
                                                <span className="text-slate-400 font-medium text-[10px]">Lesson {course.completedLessons} of {course.totalLessons}</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                <div 
                                                    className={`h-full ${course.color} transition-all duration-1000 relative`} 
                                                    style={{ width: `${course.progress}%` }}
                                                >
                                                    <div className="absolute top-0 right-0 bottom-0 w-full bg-white/20"></div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
                                            >
                                                Resume Lesson <ArrowRight className="w-3 h-3 ml-1" />
                                            </button>
                                        </div>
                                        {/* Circular Progress Indicator */}
                                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0 hidden sm:flex">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                                                <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className={`${course.color.replace('bg-', 'text-')}`} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                                            </svg>
                                            <span className="absolute text-[10px] font-bold text-slate-700">{course.progress}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Learning Analytics Section */}
                    <section className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
                                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-600" /> Analytics
                            </h2>
                            <select 
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as any)}
                                className="bg-white border border-slate-200 text-slate-500 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer hover:border-indigo-300 transition-colors"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="term">This Term</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* XP Activity Chart */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center justify-between">
                                    XP Growth <span className="text-green-500 text-xs bg-green-50 px-2 py-0.5 rounded">+12%</span>
                                </h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={currentData.xp}>
                                            <defs>
                                                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Skill Radar */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-slate-700">Skill Proficiency</h3>
                                    <div className="flex gap-2 text-[10px]">
                                        <span className="flex items-center text-indigo-600"><div className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></div> Me</span>
                                        <span className="flex items-center text-slate-400"><div className="w-2 h-2 bg-slate-400 rounded-full mr-1"></div> Avg</span>
                                    </div>
                                </div>
                                <div className="h-48 w-full flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentData.skills}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="Me"
                                                dataKey="proficiency"
                                                stroke="#8b5cf6"
                                                fill="#8b5cf6"
                                                fillOpacity={0.5}
                                            />
                                            <Radar
                                                name="Class Avg"
                                                dataKey="classAverage"
                                                stroke="#94a3b8"
                                                fill="#94a3b8"
                                                fillOpacity={0.3}
                                            />
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Course Progress Grouped Bar Chart */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow md:col-span-2">
                                <h3 className="text-sm font-bold text-slate-700 mb-4">Course Progress vs. Class Average</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={currentData.progress} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Bar dataKey="student" name="My Progress (%)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                            <Bar dataKey="average" name="Class Average (%)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Roadmap Section */}
                    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center text-sm sm:text-base">
                                <Target className="w-5 h-5 mr-2 text-indigo-600" /> AI Recommended Path
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Personalized curriculum based on your recent quiz results.</p>
                        </div>
                        
                        <div className="p-4 sm:p-6 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-7 sm:left-9 top-8 bottom-8 w-0.5 bg-slate-200/80"></div>
                            <div className="space-y-6">
                                {mockRoadmap.map((item) => (
                                    <div key={item.id} className="relative pl-8 sm:pl-10 group">
                                        <div className={`absolute left-0 top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${
                                            item.status === 'completed' ? 'bg-green-500 text-white' :
                                            item.status === 'current' ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                                            'bg-slate-200 text-slate-400'
                                        }`}>
                                            {item.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                                             item.status === 'current' ? <PlayCircle className="w-3 h-3" /> :
                                             <Lock className="w-3 h-3" />}
                                        </div>
                                        <div className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${
                                            item.status === 'current' 
                                            ? 'bg-indigo-50/50 border-indigo-200 shadow-sm translate-x-1' 
                                            : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}>
                                            <div>
                                                <h4 className={`font-bold text-sm ${item.status === 'locked' ? 'text-slate-400' : 'text-slate-900'}`}>{item.title}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                                
                                                {item.recommended_reason && (
                                                    <div className="mt-2 flex items-start gap-1.5 text-[10px] text-indigo-700 font-medium bg-white/80 p-1.5 rounded border border-indigo-100 w-fit shadow-sm">
                                                        <Brain className="w-3 h-3 mt-0.5 shrink-0" />
                                                        {item.recommended_reason}
                                                    </div>
                                                )}
                                            </div>
                                            {item.status === 'current' && (
                                                <button onClick={() => navigate('/lms')} className="text-indigo-600 bg-white p-2 rounded-full shadow-sm hover:bg-indigo-50 hover:shadow-md transition-all self-start sm:self-center">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    
                    {/* Live Class CTA (Urgent) */}
                    <div className="bg-slate-900 rounded-2xl shadow-xl p-1 overflow-hidden group">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-xl relative">
                            <div className="absolute top-3 right-3 flex gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                            <h3 className="font-bold text-white flex items-center mb-2">
                                <Video className="w-5 h-5 mr-2 text-red-500" /> Live Now
                            </h3>
                            <p className="text-slate-300 text-sm mb-4">Robotics 101: Circuit Building Workshop</p>
                            <button 
                                onClick={() => navigate('/live')}
                                className="w-full py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
                            >
                                Join Class <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Daily Challenge Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                         <div className="flex justify-between items-start mb-3 relative z-10">
                            <h3 className="font-bold flex items-center"><Target className="w-4 h-4 mr-2 text-white" /> Daily Challenge</h3>
                            <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">+50 XP</span>
                         </div>
                         <p className="text-sm text-emerald-50 mb-5 relative z-10 leading-relaxed">Complete the "Logic Gates" quiz with 100% score today.</p>
                         <div className="w-full bg-black/20 rounded-full h-2 mb-5 backdrop-blur-sm">
                             <div className="bg-white h-2 rounded-full shadow-sm" style={{width: '60%'}}></div>
                         </div>
                         <button onClick={() => navigate('/lms')} className="w-full py-2.5 bg-white text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors relative z-10 shadow-lg">
                             Continue Challenge
                         </button>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> Deadlines
                            </h3>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">Calendar</button>
                        </div>
                        <div className="space-y-3">
                            {upcomingDeadlines.map((evt, i) => (
                                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group">
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{evt.title}</h4>
                                        <p className="text-xs text-slate-500 flex items-center mt-1">
                                            <Clock className="w-3 h-3 mr-1" /> {evt.time}
                                        </p>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border ${
                                        evt.type === 'exam' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {evt.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-indigo-600" /> Recent Activity
                        </h3>
                        <div className="relative space-y-5 before:absolute before:inset-0 before:ml-3.5 before:w-0.5 before:-translate-x-px before:bg-slate-200 before:h-full">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="relative flex gap-4 items-start group">
                                    <div className={`w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10 ${
                                        activity.type === 'badge' ? 'bg-amber-100 text-amber-600' : 
                                        activity.type === 'quiz' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {activity.type === 'badge' ? <Award className="w-3.5 h-3.5" /> : 
                                         activity.type === 'quiz' ? <CheckCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 group-hover:border-indigo-200 transition-colors">
                                        <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-slate-400">{activity.time}</span>
                                            {activity.xp > 0 && (
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">+{activity.xp} XP</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Badges Gallery */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-amber-500" /> Achievements
                            </h3>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {(user.badges && user.badges.length > 0) ? (
                                user.badges.map((badge, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl mb-2 shadow-sm group-hover:scale-110 transition-transform group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:shadow-md">
                                            {['🚀', '⭐', '🏆', '🎯', '💻'][i % 5]}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 leading-tight group-hover:text-indigo-700 line-clamp-1">{badge}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-4 text-slate-400 text-sm">
                                    No badges yet. Complete lessons to earn them!
                                </div>
                            )}
                            <div className="flex flex-col items-center text-center opacity-50 grayscale group cursor-not-allowed">
                                 <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-xl mb-2 group-hover:border-slate-400 transition-colors">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 leading-tight">Next Rank</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
