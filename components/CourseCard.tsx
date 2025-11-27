
import React from 'react';
import { PlayCircle, Star, Users, ChevronRight, Play, BookOpen, Clock, Check } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onClick: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled, onClick }) => {
  const progress = course.progress || 0;
  const isCompleted = progress === 100;
  
  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group overflow-hidden flex flex-col h-full transform hover:-translate-y-1 hover:scale-[1.02] animate-in fade-in zoom-in-95"
    >
      {/* Thumbnail Section */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-slate-100">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wide">
              {course.category}
          </div>

          {isEnrolled && (
             <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in duration-300">
                <Play className="w-4 h-4 fill-current ml-0.5" />
             </div>
          )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {course.title}
          </h3>

          {isEnrolled ? (
              <div className="mt-auto pt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-2 font-bold uppercase tracking-wide">
                      <span>Progress</span>
                      <span className={isCompleted ? "text-green-600" : "text-indigo-600"}>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 relative ${isCompleted ? 'bg-green-500' : 'bg-indigo-600'}`}
                        style={{width: `${progress}%`}}
                      >
                          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30"></div>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-4 text-right">
                      {course.completed_lessons} / {course.total_lessons} Lessons Completed
                  </p>
                  
                  {isCompleted ? (
                      <button className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center text-sm shadow-md">
                          <Check className="w-4 h-4 mr-2" /> Completed
                      </button>
                  ) : (
                      <button className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl group-hover:bg-indigo-600 transition-colors flex items-center justify-center text-sm shadow-md">
                          Continue Learning <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                  )}
              </div>
          ) : (
              <>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                            {course.instructor.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700 truncate max-w-[100px]">{course.instructor}</span>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="flex items-center">
                            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            <span className="font-medium">{course.students_enrolled || 0}</span>
                        </div>
                        <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current mr-1" /> {course.rating || 'New'}
                        </div>
                    </div>
                </div>
              </>
          )}
      </div>
    </div>
  );
};
