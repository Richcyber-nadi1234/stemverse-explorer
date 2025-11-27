
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, Clock, BookOpen, Star, X, Users, Globe, GraduationCap, ChevronRight, CheckCircle2, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Course } from '../types';
import { CourseContext } from '../App';
import { CourseCard } from '../components/CourseCard';

export const LMS: React.FC = () => {
  const navigate = useNavigate();
  const catalogRef = useRef<HTMLDivElement>(null);
  const myLearningRef = useRef<HTMLElement>(null);
  const { courses, enrolledCourseIds, enrollCourse } = useContext(CourseContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  const categories = ['All', 'Robotics', 'Python', 'Scratch', 'STEM', 'Science'];

  // --- Filter Logic ---
  // Using global state for enrolled courses
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  
  const catalogCourses = courses.filter(course => {
    // If searching, show everything matching. If not searching, hide enrolled courses from catalog view to reduce clutter
    if (enrolledCourseIds.includes(course.id) && !searchQuery) return false;

    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCourseClick = (course: Course) => {
    if (enrolledCourseIds.includes(course.id)) {
      navigate(`/lms/course/${course.id}`);
    } else {
      setSelectedCourseForModal(course);
    }
  };

  const handleEnroll = () => {
    if (selectedCourseForModal) {
      enrollCourse(selectedCourseForModal.id);
      // Simulating API delay
      setTimeout(() => {
        navigate(`/lms/course/${selectedCourseForModal.id}`);
        setSelectedCourseForModal(null);
      }, 500);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6 relative">
      {/* Header & XP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Hub</h1>
          <p className="text-slate-500 text-lg mt-1">Master Robotics, Python, Scratch, and STEM skills.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center text-slate-600 shadow-sm">
               <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
               <span className="font-bold text-slate-800 mr-1">1,250</span> XP Earned
           </div>
        </div>
      </div>

      {/* Sticky Sub-Navigation */}
      {enrolledCourses.length > 0 && (
        <div className="sticky top-[-1px] z-30 bg-slate-50/95 backdrop-blur-sm py-3 border-b border-slate-200 -mx-4 px-4 sm:-mx-6 sm:px-6 transition-all shadow-sm flex items-center gap-4 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => scrollToSection(myLearningRef)}
             className="flex items-center px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors whitespace-nowrap"
           >
             <GraduationCap className="w-4 h-4 mr-2" />
             My Learning
           </button>
           <div className="h-4 w-px bg-slate-300"></div>
           <button 
             onClick={() => scrollToSection(catalogRef)}
             className="flex items-center px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors whitespace-nowrap"
           >
             <Globe className="w-4 h-4 mr-2" />
             Explore Catalog
           </button>
        </div>
      )}

      {/* --- SECTION 1: MY LEARNING (Distinct Area) --- */}
      {enrolledCourses.length > 0 && !searchQuery && (
          <section ref={myLearningRef} className="scroll-mt-28 space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                      <GraduationCap className="w-6 h-6 mr-2 text-indigo-600" /> My Active Courses
                  </h2>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      {enrolledCourses.length} Enrolled
                  </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => (
                      <CourseCard 
                        key={course.id}
                        course={course}
                        isEnrolled={true}
                        onClick={() => handleCourseClick(course)}
                      />
                  ))}
              </div>
          </section>
      )}

      {/* --- SECTION 2: CATALOG (Scroll Target) --- */}
      <div ref={catalogRef} className="space-y-6 pt-8 scroll-mt-24 border-t border-slate-200/50 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-16 z-20">
             <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-600" /> 
                <h2 className="text-lg font-bold text-slate-800">Explore Catalog</h2>
             </div>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 justify-end">
                <div className="relative w-full sm:w-auto min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Find a new skill..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full bg-slate-50 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                        selectedCategory === cat 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
        
        {/* Grid/List View */}
        {catalogCourses.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                 <div className="bg-slate-50 p-4 rounded-full inline-flex mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-slate-500 font-medium text-lg">No courses found matching your criteria.</p>
                 <button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
             </div>
        ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {catalogCourses.map(course => (
                    <CourseCard 
                      key={course.id}
                      course={course}
                      isEnrolled={enrolledCourseIds.includes(course.id)}
                      onClick={() => handleCourseClick(course)}
                    />
                ))}
            </div>
        )}
      </div>

      {/* --- ENROLLMENT MODAL --- */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300 relative">
                <button 
                    onClick={() => setSelectedCourseForModal(null)}
                    className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Visuals */}
                <div className="w-full md:w-2/5 relative bg-slate-900">
                    <img src={selectedCourseForModal.thumbnail} className="w-full h-64 md:h-full object-cover opacity-80" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-transparent to-transparent md:bg-gradient-to-r"></div>
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg mb-3 inline-block uppercase tracking-wider">
                            {selectedCourseForModal.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3">{selectedCourseForModal.title}</h2>
                        <div className="flex items-center gap-4 text-indigo-100 text-sm">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="font-bold text-white">{selectedCourseForModal.rating}</span>
                            </div>
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 opacity-70" />
                                <span>{selectedCourseForModal.students_enrolled} students</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right: Details */}
                <div className="w-full md:w-3/5 flex flex-col bg-white">
                    <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Course Overview</h3>
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                    {selectedCourseForModal.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Instructor</div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700">{selectedCourseForModal.instructor.charAt(0)}</div>
                                        {selectedCourseForModal.instructor}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Duration</div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {Math.round((selectedCourseForModal.total_lessons * 45) / 60)} Hours
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Content</div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                        <BookOpen className="w-4 h-4 text-slate-400" />
                                        {selectedCourseForModal.total_lessons} Lessons
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Level</div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                        <LayoutGrid className="w-4 h-4 text-slate-400" />
                                        Beginner
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What you'll learn</h3>
                                <ul className="space-y-3">
                                    {['Master core concepts effectively', 'Build real-world projects from scratch', 'Earn a verified certificate of completion'].map((item, i) => (
                                        <li key={i} className="flex items-start text-sm text-slate-700">
                                            <div className="p-0.5 bg-green-100 rounded-full mr-3 mt-0.5">
                                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Total Price</p>
                            <p className="text-3xl font-bold text-slate-900">Free</p>
                        </div>
                        <button 
                            onClick={handleEnroll}
                            className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-indigo-600 shadow-xl shadow-indigo-200/50 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
                        >
                            Enroll Now <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
