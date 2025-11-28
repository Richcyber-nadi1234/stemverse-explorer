
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, FileText, ChevronLeft, ChevronRight, Lock, MessageCircle, Award, Layout, Upload, Paperclip, AlertCircle, Video, Circle, Clock, Radio, ExternalLink, Sparkles, Bot, Star, Trophy, Info } from 'lucide-react';
import { Lesson } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { CourseContext } from '../contexts/CourseContext';
import { ToastContext } from '../contexts/ToastContext';

const mockLessons: Lesson[] = [
  // Robotics Course
  { id: 'l1', course_id: 'c1', title: '1. What is a Robot?', type: 'video', duration_mins: 5, completed: true, content_url: 'https://www.youtube.com/embed/8wYOXIe5wts' },
  { id: 'l2', course_id: 'c1', title: '2. Sensors & Motors', type: 'video', duration_mins: 10, completed: false, content_url: 'https://www.youtube.com/embed/tIeHLnjs5U8' },
  { id: 'l3', course_id: 'c1', title: '3. Live: Build Along', type: 'live_class', duration_mins: 45, completed: false, liveConfig: { startTime: 'Saturday, 10:00 AM', platform: 'internal' } },
  
  // Python Course
  { id: 'p1', course_id: 'c2', title: '1. Install Python & IDLE', type: 'video', duration_mins: 8, completed: false, content_url: 'https://www.youtube.com/embed/7DqDTcEez8E' },
  { id: 'p2', course_id: 'c2', title: '2. AI Generated: Understanding Loops', type: 'video', duration_mins: 5, completed: false }, // AI Placeholder
  { id: 'p3', course_id: 'c2', title: '3. Your First Variables', type: 'text', duration_mins: 10, completed: false },
  { id: 'p4', course_id: 'c2', title: '4. Mini-Quiz: Logic', type: 'quiz', duration_mins: 10, completed: false },

  // Solar System Course (New)
  { id: 'ss1', course_id: 'm3', title: '1. The Sun', type: 'video', duration_mins: 10, completed: false, content_url: 'https://www.youtube.com/embed/2HoTK_coso2s' },
  { id: 'ss2', course_id: 'm3', title: '2. Mercury & Venus', type: 'text', duration_mins: 15, completed: false },
];

export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const { courses, updateCourse } = useContext(CourseContext);
  const { showToast } = useContext(ToastContext);
  
  // Find current course from context
  const activeCourse = courses.find(c => c.id === courseId);

  // Filter lessons based on current course ID
  const courseLessons = mockLessons.filter(l => l.course_id === courseId);
  const displayLessons = courseLessons.length > 0 ? courseLessons : [];

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(displayLessons[0] || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'submitted' | 'graded'>('pending');
  
  // Rewards UI State
  const [showCoinReward, setShowCoinReward] = useState(false);
  const [showCompletionBonus, setShowCompletionBonus] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: string; color: string; size: number; rotate: number; duration: number; delay: number }>>([]);
  
  // Local tracking of completed lessons for immediate UI feedback before context sync
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Initialize state based on course context or mock data
  useEffect(() => {
      if (displayLessons.length > 0) {
          setActiveLesson(displayLessons[0]);
          // In a real app, completedLessonIds would come from backend per user/course enrollment record
          // For now, we rely on the mock data's 'completed' flag or local state
          const initialCompleted = new Set(displayLessons.filter(l => l.completed).map(l => l.id));
          setCompletedLessonIds(initialCompleted);
      }
  }, [courseId]);

  function ensureAudioCtx() {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioCtxRef.current;
  }

  async function resumeIfSuspended() {
      const ctx = ensureAudioCtx();
      if (ctx.state === 'suspended') {
          try { await ctx.resume(); } catch (e) { /* noop */ }
      }
      return ctx;
  }

  async function playCoinSound() {
      const ctx = await resumeIfSuspended();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
  }

  async function playFanfare() {
      const ctx = await resumeIfSuspended();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
      g.connect(ctx.destination);

      const notes = [440, 660, 880];
      notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
          o.connect(g);
          o.start(ctx.currentTime + i * 0.2);
          o.stop(ctx.currentTime + i * 0.2 + 0.45);
      });
  }

  function triggerConfetti() {
      const count = 120;
      const colors = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#fb7185'];
      const pieces = Array.from({ length: count }).map((_, idx) => {
          const left = `${Math.random() * 100}%`;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.floor(Math.random() * 8) + 6;
          const rotate = Math.floor(Math.random() * 360);
          const duration = Math.random() * 2 + 3.5;
          const delay = Math.random() * 0.5;
          return { id: idx, left, color, size, rotate, duration, delay };
      });
      setConfettiPieces(pieces);
      setConfettiOn(true);
      window.setTimeout(() => {
          setConfettiOn(false);
          setConfettiPieces([]);
      }, 5000);
  }

  useEffect(() => {
      if (showCoinReward) {
          playCoinSound();
      }
  }, [showCoinReward]);

  useEffect(() => {
      if (showCompletionBonus) {
          playFanfare();
          triggerConfetti();
      }
  }, [showCompletionBonus]);

  // Ensure audio context is resumed after any user interaction
  useEffect(() => {
      const resume = () => { resumeIfSuspended(); };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
      window.addEventListener('touchstart', resume, { once: true });
      return () => {
          window.removeEventListener('pointerdown', resume);
          window.removeEventListener('keydown', resume);
          window.removeEventListener('touchstart', resume);
      };
  }, []);

  if (!activeCourse) {
      return <div className="p-8 text-center text-white">Course not found.</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSubmissionFile(e.target.files[0]);
      }
  };

  const handleSubmitAssignment = () => {
      if (!submissionFile) return;
      setSubmissionStatus('submitted');
      if (activeLesson) markLessonComplete(activeLesson.id);
      showToast('Assignment submitted successfully!', 'success');
  };

  const markLessonComplete = (lessonId: string) => {
      if (!completedLessonIds.has(lessonId)) {
          const newCompleted = new Set(completedLessonIds).add(lessonId);
          setCompletedLessonIds(newCompleted);
          
          // Update Course Progress in Context
          const newCompletedCount = (activeCourse.completed_lessons || 0) + 1;
          const newProgress = Math.min(100, Math.round((newCompletedCount / (activeCourse.total_lessons || 1)) * 100));
          
          updateCourse({
              ...activeCourse,
              completed_lessons: newCompletedCount,
              progress: newProgress
          });

          // Check Course Completion
          const isCourseComplete = newCompleted.size === displayLessons.length;
          
          let starsAwarded = 50;
          let xpAwarded = 100;

          if (isCourseComplete) {
              starsAwarded += 500; // Bonus
              xpAwarded += 1000;   // Bonus
              setShowCompletionBonus(true);
          } else {
              setShowCoinReward(true);
              setTimeout(() => setShowCoinReward(false), 3000); // Hide lesson reward after animation
          }

          // Award Coins & XP
          if (user) {
              updateUser({
                  coins: (user.coins || 0) + starsAwarded,
                  xp: (user.xp || 0) + xpAwarded
              });
          }
      }
  };

  const joinLiveClass = () => {
      if (activeLesson?.liveConfig?.meetingLink) {
          window.open(activeLesson.liveConfig.meetingLink, '_blank');
      } else {
          navigate('/live');
      }
  };

  const handleAskInstructor = () => {
      if (activeLesson) {
        window.dispatchEvent(new CustomEvent('open-ai-tutor', { 
            detail: { context: activeLesson.title } 
        }));
      }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-slate-900 text-white -m-4 md:-m-8 relative">
      {confettiOn && (
        <div className="absolute inset-0 pointer-events-none z-[70]">
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {confettiPieces.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  transform: `rotate(${p.rotate}deg)`,
                  borderRadius: 2,
                  animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards, confetti-tilt ${p.duration}s ease-in-out ${p.delay}s`,
                  opacity: 0.95,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(360deg); opacity: 0.9; }
            }
            @keyframes confetti-tilt {
              0% { filter: brightness(1); }
              50% { filter: brightness(1.2); }
              100% { filter: brightness(1); }
            }
          `}</style>
        </div>
      )}
      
      {/* Star Reward Animation (Lesson) */}
      {showCoinReward && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in fade-in duration-500 pointer-events-none">
              <div className="bg-yellow-400 text-yellow-900 px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center border-4 border-yellow-200">
                  <Star className="w-16 h-16 fill-yellow-100 animate-spin-slow mb-2" />
                  <h3 className="text-3xl font-extrabold">+50 Stars</h3>
                  <p className="font-bold text-sm">+100 XP</p>
              </div>
          </div>
      )}

      {/* Course Completion Modal */}
      {showCompletionBonus && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
              <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 max-w-lg text-center relative overflow-hidden border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                  {/* Confetti/Rays Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white -z-10"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200/50 via-transparent to-transparent animate-pulse"></div>

                  <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                      <Trophy className="w-16 h-16 text-yellow-600 drop-shadow-md" />
                  </div>
                  
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Course Completed!</h2>
                  <p className="text-slate-500 text-lg mb-8">You've mastered this subject. Outstanding work!</p>
                  
                  <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 shadow-lg">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Rewards</p>
                      <div className="flex justify-center gap-8">
                          <div className="flex flex-col items-center">
                              <span className="text-3xl font-bold text-yellow-400 flex items-center gap-2"><Star className="fill-yellow-400 w-6 h-6" /> +500</span>
                              <span className="text-xs font-bold mt-1">Stars</span>
                          </div>
                          <div className="w-px bg-slate-700"></div>
                          <div className="flex flex-col items-center">
                              <span className="text-3xl font-bold text-purple-400 flex items-center gap-2"><Award className="w-6 h-6" /> +1000</span>
                              <span className="text-xs font-bold mt-1">XP</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button 
                        onClick={() => navigate('/student-dashboard')}
                        className="flex-1 py-3.5 bg-slate-200 text-slate-800 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                      >
                          Dashboard
                      </button>
                      <button 
                        onClick={() => navigate('/marketplace')}
                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                      >
                          Spend Stars
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navigation (Mobile) */}
        <div className="lg:hidden p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
             <button onClick={() => navigate('/lms')} className="text-slate-400 hover:text-white">
                 <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="font-bold text-sm truncate">{activeLesson?.title || 'Course'}</span>
             <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                 <Layout className="w-5 h-5 text-slate-400" />
             </button>
        </div>

        {/* Content Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          
          {!activeLesson ? (
              <div className="text-center text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a lesson to start learning.</p>
              </div>
          ) : activeLesson.type === 'video' ? (
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
                            completedLessonIds.has(activeLesson.id) 
                            ? 'bg-green-100 text-green-700 shadow-none cursor-default' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'
                        }`}
                      >
                          {completedLessonIds.has(activeLesson.id) ? <><CheckCircle className="w-5 h-5" /> Completed</> : "Mark as Complete"}
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
                    <p className="text-white font-bold text-lg truncate max-w-md">{activeLesson?.title || 'Select a lesson'}</p>
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
      <div className={`${sidebarOpen ? 'w-full lg:w-96' : 'w-0'} transition-all duration-300 bg-slate-800 border-l border-slate-700 flex flex-col shrink-0 overflow-hidden`}>
        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
            <Link to="/lms" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center mb-4 font-bold uppercase tracking-wider">
                <ChevronLeft className="w-3 h-3 mr-1" /> Back to Course
            </Link>
            <h3 className="font-bold text-xl leading-tight text-white mb-2">{activeCourse.title}</h3>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
               <span className="flex items-center"><Info className="w-3 h-3 mr-1" /> {activeCourse.instructor}</span>
               <span>•</span>
               <span>{activeCourse.total_lessons} Lessons</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Progress</span>
                <span>{activeCourse.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${activeCourse.progress || 0}%` }}></div>
            </div>
        </div>

        <div className="p-4 bg-slate-800/50 border-b border-slate-700 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
            {activeCourse.description}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {displayLessons.map((lesson, index) => (
                <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full p-5 flex items-start gap-4 text-left hover:bg-slate-700/30 transition-colors border-b border-slate-700/30 group ${
                        activeLesson?.id === lesson.id ? 'bg-slate-700/50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'
                    }`}
                >
                    <div className="mt-1">
                        {completedLessonIds.has(lesson.id) ? (
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
                        <p className={`text-sm font-bold mb-1 ${activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
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
            {displayLessons.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                    No lessons available for this course yet.
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800">
            <button 
                onClick={handleAskInstructor}
                disabled={!activeLesson}
                className="w-full py-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Bot className="w-4 h-4" /> Ask Newton (AI Tutor)
            </button>
        </div>
      </div>
    </div>
  );
};
