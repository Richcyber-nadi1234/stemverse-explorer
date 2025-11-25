
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { ArrowRight, BookOpen, Trophy, Video, Brain, School, Users, Star, CheckCircle2, Wallet, UploadCloud, Radio, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Logo } from '../components/Logo';
import { UserRole } from '../types';

const courseShowcase = [
  { 
    title: "Robotics for Beginners", 
    src: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=600",
    tag: "Ages 8-12"
  },
  { 
    title: "Python Game Dev", 
    src: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=600",
    tag: "Ages 10-14"
  },
  { 
    title: "Scratch Animation", 
    src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600",
    tag: "Ages 6-9"
  },
  { 
    title: "Drone Engineering", 
    src: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600",
    tag: "Ages 12+"
  },
  { 
    title: "Circuit Building", 
    src: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&q=80&w=600",
    tag: "Ages 8-14"
  },
  { 
    title: "3D Printing Design", 
    src: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=600",
    tag: "Ages 10+"
  }
];

export const Landing: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.roles.includes(UserRole.STUDENT) && user.roles.length === 1) {
          navigate('/student-dashboard');
      } else {
          navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thanks for reaching out! We'll get back to you shortly.");
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Custom Styles for Carousel and Hero Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pan-image {
          0% { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -2%); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Logo className="w-full h-full" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                STEMverse
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('schools')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors relative group">
                For Schools
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('tutors')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors relative group">
                For Tutors
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-indigo-600 font-bold text-sm"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 flex items-center group"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-12 lg:pt-48 lg:pb-20 overflow-hidden relative bg-slate-50">
        
        {/* Animated Background Image with Gradients */}
        <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full z-0 overflow-hidden pointer-events-none">
           <img 
             src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
             alt="STEM Background"
             className="w-full h-full object-cover opacity-80 lg:opacity-100"
             style={{ animation: 'pan-image 40s linear infinite alternate' }}
           />
           {/* Left Gradient Blend (Fades to Text Area) */}
           <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent"></div>
           {/* Bottom Gradient Blend (Fades to Next Section) */}
           <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-6 shadow-sm animate-in zoom-in duration-500 delay-100">
                <Star className="w-3 h-3 fill-indigo-600" /> The #1 STEM Platform in Africa
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Ignite Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Future in STEM</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                An AI-powered, gamified learning ecosystem connecting students, schools, and tutors. Master Robotics, Coding, and Science in a fun, immersive world.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center group hover:-translate-y-1"
                >
                  Join the Classroom
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-white hover:shadow-md transition-all flex items-center justify-center group hover:-translate-y-1"
                >
                  Partner Your School
                </button>
              </div>

              <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden hover:scale-110 hover:z-10 transition-transform">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p>Join <span className="font-bold text-slate-900">10,000+</span> students learning today.</p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:h-[600px] flex items-center justify-center animate-in fade-in duration-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl opacity-70 animate-pulse"></div>
              
              {/* Main Card */}
              <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-3 transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-float">
                <div className="rounded-2xl overflow-hidden aspect-square relative bg-slate-900 flex items-center justify-center">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
                   <div className="w-48 h-48 text-white drop-shadow-2xl">
                      <Logo className="w-full h-full" />
                   </div>
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-8">
                      <div className="text-white">
                        <p className="font-bold text-2xl mb-2">Intro to Robotics</p>
                        <div className="flex items-center gap-2 text-sm opacity-90 font-medium bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          Live Class in Session
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Achievement</p>
                  <p className="font-bold text-slate-900">Code Ninja Unlocked!</p>
                </div>
              </div>

              <div className="absolute bottom-20 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow delay-700 hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">AI Tutor</p>
                  <p className="font-bold text-slate-900">"Great job on that quiz!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- IMAGE CAROUSEL SECTION --- */}
      <section className="py-10 bg-slate-50 overflow-hidden mb-10 relative z-10">
        <div className="mb-8 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Explore Courses for Ages 6-14</p>
        </div>
        <div className="flex animate-scroll">
            {/* Duplicate the list to create infinite loop effect */}
            {[...courseShowcase, ...courseShowcase].map((item, index) => (
                <div key={index} className="flex-shrink-0 w-72 mx-4 relative group cursor-pointer">
                    <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-md border border-slate-100 group-hover:shadow-xl transition-all transform group-hover:-translate-y-2 duration-300">
                        <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent">
                            <div className="absolute bottom-4 left-4">
                                <span className="inline-block px-2 py-0.5 rounded bg-indigo-600 text-[10px] font-bold text-white mb-1 shadow-sm">{item.tag}</span>
                                <h3 className="text-white font-bold text-lg">{item.title}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to excel</h2>
            <p className="text-slate-500 text-lg">We combine world-class curriculum with cutting-edge technology to create an unforgettable learning experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, title: 'Gamified Learning', desc: 'Earn XP, badges, and climb leaderboards while mastering complex topics.' },
              { icon: Video, title: 'Live Virtual Classes', desc: 'Interactive video sessions with whiteboards, polls, and breakout rooms.' },
              { icon: Brain, title: 'AI Personal Tutor', desc: '24/7 homework help and personalized study roadmaps driven by AI.' },
              { icon: School, title: 'School Management', desc: 'Complete SMS for attendance, grading, reporting, and fee management.' },
              { icon: Users, title: 'Creator Marketplace', desc: 'Youth tutors can create content, teach peers, and earn income.' },
              { icon: BookOpen, title: 'STEM Curriculum', desc: 'Expert-designed courses in Robotics, Coding, Science, and Math.' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-8 duration-700 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:rotate-3">
                  <feature.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SCHOOLS SECTION --- */}
      <section id="schools" className="py-24 bg-slate-900 relative text-white overflow-hidden z-10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in slide-in-from-left-12 duration-1000">
              <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2 block">For Educational Institutions</span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Upgrade Your School to the Digital Age</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Replace fragmented tools with one powerful operating system. Manage students, staff, payments, and curriculum in a single, secure dashboard.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Automated Report Cards & Transcripts',
                  'Teacher & Staff Payroll Management',
                  'Attendance Tracking & Behavior Logs',
                  'Seamless Fee Collection & Financial Reports'
                ].map((item, i) => (
                  <div key={i} className="flex items-center group">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-1"
              >
                Register Your School
              </button>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
              <div className="animate-float">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Admin Dashboard</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Total Students</p>
                      <p className="text-2xl font-bold">1,240</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Revenue (Term 1)</p>
                      <p className="text-2xl font-bold text-green-400">$45,200</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-8 bg-slate-700/60 rounded w-full"></div>
                    <div className="h-8 bg-slate-700/40 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TUTORS SECTION --- */}
      <section id="tutors" className="py-24 bg-indigo-50 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">For Tutors & Creators</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Teach globally, earn locally</h2>
            <p className="text-slate-600 text-lg">
              Turn your knowledge into a business. Create courses, host live classes, and sell digital resources to thousands of students across the continent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both delay-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Create Content</h3>
              <p className="text-slate-500">Use our Course Studio to build quizzes, assignments, and video lessons with AI assistance.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center relative transform md:-translate-y-4 z-10 animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both delay-200 hover:shadow-xl transition-all hover:-translate-y-5">
              <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                Most Popular
              </div>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Host Live Classes</h3>
              <p className="text-slate-500">Schedule real-time sessions with interactive whiteboards, polls, and breakout rooms.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both delay-300 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Get Paid</h3>
              <p className="text-slate-500">Set your prices. Receive payouts directly to your mobile money or bank account.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 border-2 border-indigo-100 px-8 py-4 rounded-xl font-bold hover:border-indigo-600 hover:bg-indigo-50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              Apply as a Youth Tutor
            </button>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-slate-900 relative overflow-hidden z-10">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-bounce-slow">
             <Logo className="w-full h-full" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Ready to start your journey?</h2>
          <p className="text-indigo-200 text-lg mb-10">Join thousands of students, teachers, and schools transforming education in Africa.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1"
            >
              Student Sign Up
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all hover:-translate-y-1"
            >
              School Registration
            </button>
          </div>
        </div>
      </section>

      {/* --- CONTACT US SECTION --- */}
      <section id="contact" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Contact Info */}
            <div>
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">Get in Touch</span>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">We'd love to hear from you</h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Have questions about school partnerships, tutoring, or just want to say hi? Reach out to our team.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mr-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email Us</h4>
                    <p className="text-slate-500">support@stemverse.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mr-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Call Us</h4>
                    <p className="text-slate-500">+233 50 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mr-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Visit Us</h4>
                    <p className="text-slate-500">123 Innovation Drive, Accra, Ghana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={contactForm.email}
                    onChange={e => setContactForm({...contactForm, email: e.target.value})}
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                  <textarea 
                    value={contactForm.message}
                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    required
                    rows={4}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    placeholder="How can we help you?"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center group"
                >
                  Send Message <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8">
                <Logo className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-white">STEMverse</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">Empowering the next generation of African innovators through accessible, gamified STEM education.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Live Classes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-900 text-center text-xs">
          &copy; 2024 STEMverse Education. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
