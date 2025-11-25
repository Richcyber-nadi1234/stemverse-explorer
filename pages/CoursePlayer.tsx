
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, FileText, ChevronLeft, ChevronRight, Lock, MessageCircle, Award, Layout, Upload, Paperclip, AlertCircle, Video, Circle, Clock, Radio, ExternalLink, Sparkles } from 'lucide-react';
import { Lesson } from '../types';

const mockLessons: Lesson[] = [
  // Robotics Course
  { id: 'l1', course_id: 'c_robotics_fund', title: '1. What is a Robot?', type: 'video', duration_mins: 5, completed: true, content_url: 'https://www.youtube.com/embed/8wYOXIe5wts' },
  { id: 'l2', course_id: 'c_robotics_fund', title: '2. Sensors & Motors', type: 'video', duration_mins: 10, completed: false, content_url: 'https://www.youtube.com/embed/tIeHLnjs5U8' },
  { id: 'l3', course_id: 'c_robotics_fund', title: '3. Live: Build Along', type: 'live_class', duration_mins: 45, completed: false, liveConfig: { startTime: 'Saturday, 10:00 AM', platform: 'internal' } },
  
  // Python Course
  { id: 'p1', course_id: 'c_python_kids', title: '1. Install Python & IDLE', type: 'video', duration_mins: 8, completed: false, content_url: 'https://www.youtube.com/embed/7DqDTcEez8E' },
  { id: 'p2', course_id: 'c_python_kids', title: '2. AI Generated: Understanding Loops', type: 'video', duration_mins: 5, completed: false }, // AI Placeholder
  { id: 'p3', course_id: 'c_python_kids', title: '3. Your First Variables', type: 'text', duration_mins: 10, completed: false },
  { id: 'p4', course_id: 'c_python_kids', title: '4. Mini-Quiz: Logic', type: 'quiz', duration_mins: 10, completed: false },

  // Scratch Course
  { id: 's1', course_id: 'c_scratch_magic', title: '1. Intro to Scratch', type: 'video', duration_mins: 6, completed: false, content_url: 'https://www.youtube.com/embed/jXUZaf5D12A' },
  { id: 's2', course_id: 'c_scratch_magic', title: '2. Making the Cat Move', type: 'video', duration_mins: 12, completed: false, content_url: 'https://www.youtube.com/embed/VIpmKeqdlLQ' },
];

export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const courseLessons = mockLessons.filter(l => l.course_id === courseId);
  // Fallback if courseId doesn't match (e.g. generic demo)
  const displayLessons = courseLessons.length > 0 ? courseLessons : mockLessons.slice(0,3);

  const [activeLesson, setActiveLesson] = useState<Lesson>(displayLessons[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'submitted' | 'graded'>('pending');
  
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(['l1']));

  // Update active lesson when route changes or lessons load
  useEffect(() => {
      if (displayLessons.length > 0) {
          setActiveLesson(displayLessons[0]);
      }
  }, [courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSubmissionFile(e.target.files[0]);
      }
  };

  const handleSubmitAssignment = () => {
      if (!submissionFile) return;
      setSubmissionStatus('submitted');
      markLessonComplete(activeLesson.id);
      alert('Assignment submitted successfully!');
  };

  const markLessonComplete = (lessonId: string) => {
      setCompletedLessons(prev => new Set(prev).add(lessonId));
  };

  const joinLiveClass = () => {
      if (activeLesson.liveConfig?.meetingLink) {
          window.open(activeLesson.liveConfig.meetingLink, '_blank');
      } else {
          navigate('/live');
      }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-slate-900 text-white -m-4 md:-m-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navigation (Mobile) */}
        <div className="lg:hidden p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
             <button onClick={() => navigate('/lms')} className="text-slate-400 hover:text-white">
                 <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="font-bold text-sm truncate">{activeLesson.title}</span>
             <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                 <Layout className="w-5 h-5 text-slate-400" />
             </button>
        </div>

        {/* Content Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          
          {/* VIDEO RENDERER */}
          {activeLesson.type === 'video' ? (
            activeLesson.content_url ? (
                <iframe 
                    src={activeLesson.content_url} 
                    title={activeLesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                // Placeholder for AI Generated or Missing Video
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500 relative group">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600/40 transition-colors cursor-pointer animate-pulse">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-300 mb-2">{activeLesson.title}</h2>
                    <p className="text-sm flex items-center gap-2">
                        {activeLesson.title.includes('AI Generated') ? <Sparkles className="w-4 h-4 text-amber-400" /> : null} 
                        {activeLesson.title.includes('AI Generated') ? "AI Video Generation in progress..." : "Video content placeholder"}
                    </p>
                    
                    <button 
                        onClick={() => markLessonComplete(activeLesson.id)}
                        className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all"
                    >
                        Mark as Watched
                    </button>
                </div>
            )
          ) : activeLesson.type === 'live_class' ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="max-w-lg w-full bg-slate-800/50 backdrop-blur-xl rounded-3xl p-10 border border-slate-700 text-center shadow-2xl relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/50">
                         <Radio className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3">{activeLesson.title}</h2>
                    <div className="flex items-center justify-center gap-3 text-slate-400 mb-8">
                        <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            <Clock className="w-4 h-4" /> {activeLesson.liveConfig?.startTime?.replace('T', ' ') || 'Scheduled Time'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            <Video className="w-4 h-4" /> {activeLesson.liveConfig?.platform === 'zoom' ? 'Zoom' : activeLesson.liveConfig?.platform === 'meet' ? 'Meet' : 'Live Class'}
                        </span>
                    </div>
                    
                    <button 
                        onClick={joinLiveClass}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-900/40 transform hover:scale-[1.02]"
                    >
                        {activeLesson.liveConfig?.meetingLink ? <ExternalLink className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        {activeLesson.liveConfig?.meetingLink ? 'Open Meeting Link' : 'Join Class Now'}
                    </button>
                </div>
            </div>
          ) : activeLesson.type === 'text' ? (
             <div className="w-full h-full bg-white text-slate-900 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold mb-4 uppercase tracking-wider">
                      <FileText className="w-4 h-4" /> Reading Material
                  </div>
                  <h1 className="text-4xl font-bold mb-8 text-slate-900">{activeLesson.title}</h1>
                  <div className="prose prose-lg prose-slate max-w-none">
                    <p>This is a text lesson placeholder. In a real scenario, this would contain markdown content, images, and diagrams related to the topic.</p>
                    <h3>Key Concepts</h3>
                    <ul className="bg-slate-50 p-6 rounded-xl border border-slate-100 list-none space-y-2">
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Concept 1</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Concept 2</li>
                    </ul>
                  </div>
                  <div className="mt-16 pt-8 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => markLessonComplete(activeLesson.id)}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                            completedLessons.has(activeLesson.id) 
                            ? 'bg-green-100 text-green-700 shadow-none cursor-default' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'
                        }`}
                      >
                          {completedLessons.has(activeLesson.id) ? <><CheckCircle className="w-5 h-5" /> Completed</> : "Mark as Complete"}
                      </button>
                  </div>
                </div>
             </div>
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <div className="bg-slate-700 p-10 rounded-3xl text-center max-w-md mx-4 shadow-2xl border border-slate-600">
                    <Award className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold mb-3 text-white">Quiz / Assignment</h2>
                    <p className="text-slate-300 mb-8 leading-relaxed">Test your knowledge to unlock the next section.</p>
                    <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg">
                        Start
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-20 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 lg:px-8 z-10">
            <div className="flex items-center gap-4">
                <div className="hidden md:block">
                    <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">Current Lesson</h2>
                    <p className="text-white font-bold text-lg truncate max-w-md">{activeLesson.title}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-bold flex items-center transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </button>
                <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center shadow-lg transition-colors">
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-full lg:w-96' : 'w-0'} transition-all duration-300 bg-slate-800 border-l border-slate-700 flex flex-col shrink-0`}>
        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
            <Link to="/lms" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center mb-4 font-bold uppercase tracking-wider">
                <ChevronLeft className="w-3 h-3 mr-1" /> Back to Course
            </Link>
            <h3 className="font-bold text-xl leading-tight text-white mb-4">Course Curriculum</h3>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Progress</span>
                <span>{Math.round((completedLessons.size / displayLessons.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(completedLessons.size / displayLessons.length) * 100}%` }}></div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {displayLessons.map((lesson, index) => (
                <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full p-5 flex items-start gap-4 text-left hover:bg-slate-700/30 transition-colors border-b border-slate-700/30 group ${
                        activeLesson.id === lesson.id ? 'bg-slate-700/50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'
                    }`}
                >
                    <div className="mt-1">
                        {completedLessons.has(lesson.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : lesson.type === 'live_class' ? (
                             <div className="relative">
                                <div className="absolute inset-0 bg-red-500 blur-sm opacity-50 animate-pulse"></div>
                                <Video className="w-5 h-5 text-red-500 relative z-10" />
                             </div>
                        ) : (
                            <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-bold mb-1 ${activeLesson.id === lesson.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                            {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50">
                                {lesson.type === 'video' ? <Play className="w-3 h-3 mr-1.5" /> : 
                                 lesson.type === 'assignment' ? <FileText className="w-3 h-3 mr-1.5" /> :
                                 lesson.type === 'live_class' ? <Video className="w-3 h-3 mr-1.5" /> :
                                 <FileText className="w-3 h-3 mr-1.5" />}
                                {lesson.duration_mins} min
                            </span>
                        </div>
                    </div>
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800">
            <button className="w-full py-3 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-bold transition-colors">
                <MessageCircle className="w-4 h-4" /> Ask Instructor
            </button>
        </div>
      </div>
    </div>
  );
};
