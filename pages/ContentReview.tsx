
import React, { useContext, useState } from 'react';
import { CourseContext } from '../contexts/CourseContext';
import { ToastContext } from '../contexts/ToastContext';
import { CheckCircle, XCircle, Eye, BookOpen, User, Clock, AlertTriangle } from 'lucide-react';
import { Course } from '../types';

export const ContentReview: React.FC = () => {
  const { courses, updateCourse } = useContext(CourseContext);
  const { showToast } = useContext(ToastContext);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter for courses pending review
  const pendingCourses = courses.filter(c => c.status === 'pending_review');

  const handleApprove = (course: Course) => {
    if (window.confirm(`Approve "${course.title}" for publication?`)) {
        updateCourse({
            ...course,
            status: 'published',
            rejectionReason: undefined // Clear any previous rejection history
        });
        showToast(`Course "${course.title}" approved and published!`, 'success');
    }
  };

  const handleReject = () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    
    const course = courses.find(c => c.id === rejectingId);
    if (course) {
        updateCourse({
            ...course,
            status: 'rejected',
            rejectionReason: rejectionReason
        });
        showToast(`Course "${course.title}" rejected.`, 'info');
        setRejectingId(null);
        setRejectionReason('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Content Review</h1>
        <p className="text-slate-500">Review and approve course materials submitted by teachers.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {pendingCourses.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
                  <p className="text-slate-500 mt-1">There are no pending courses to review at this time.</p>
              </div>
          ) : (
              <div className="divide-y divide-slate-100">
                  {pendingCourses.map(course => (
                      <div key={course.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col md:flex-row gap-6">
                              {/* Thumbnail */}
                              <div className="w-full md:w-48 h-32 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                              </div>

                              {/* Details */}
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center border border-amber-200">
                                          <Clock className="w-3 h-3 mr-1" /> Pending Review
                                      </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                      <div className="flex items-center">
                                          <User className="w-4 h-4 mr-1.5" />
                                          {course.instructor}
                                      </div>
                                      <div className="flex items-center">
                                          <BookOpen className="w-4 h-4 mr-1.5" />
                                          {course.total_lessons} Modules
                                      </div>
                                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-xs font-medium">
                                          {course.category}
                                      </span>
                                  </div>

                                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{course.description}</p>

                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Content Preview</h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {course.modules?.slice(0, 4).map((mod, i) => (
                                              <div key={i} className="text-xs text-slate-700 flex items-center">
                                                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold mr-2">{i+1}</span>
                                                  <span className="truncate">{mod.title}</span>
                                              </div>
                                          ))}
                                          {(course.modules?.length || 0) > 4 && (
                                              <div className="text-xs text-slate-400 italic pl-6">...and {(course.modules?.length || 0) - 4} more</div>
                                          )}
                                      </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-3 pt-2">
                                      <button 
                                        onClick={() => handleApprove(course)}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                                      >
                                          <CheckCircle className="w-4 h-4 mr-2" /> Approve & Publish
                                      </button>
                                      <button 
                                        onClick={() => setRejectingId(course.id)}
                                        className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                      >
                                          <XCircle className="w-4 h-4 mr-2" /> Reject
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="text-lg font-bold text-slate-900">Reject Submission</h3>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4">
                      Please provide a reason for rejecting this course. This feedback will be sent to the instructor.
                  </p>

                  <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32 text-sm mb-4"
                      placeholder="e.g. Missing quiz content in Module 3..."
                      autoFocus
                  />

                  <div className="flex justify-end gap-3">
                      <button 
                          onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleReject}
                          disabled={!rejectionReason.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                      >
                          Confirm Rejection
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
