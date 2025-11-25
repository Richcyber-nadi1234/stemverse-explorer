
import React, { useState } from 'react';
import { CheckCircle, Clock, Eye, FileText, Download, X, MessageSquare, Save } from 'lucide-react';
import { Submission } from '../types';

const mockSubmissions: Submission[] = [
  { 
    id: 's1', 
    student_name: 'Kwame Mensah', 
    exam_title: 'Robotics: Blink an LED', 
    submitted_at: '2023-10-10 10:30 AM', 
    status: 'pending', 
    total_marks: 50,
    file_url: 'assignment_code.ino',
    feedback: ''
  },
  { 
    id: 's2', 
    student_name: 'Ama Osei', 
    exam_title: 'Math Mid-Term', 
    submitted_at: '2023-10-10 11:15 AM', 
    status: 'graded', 
    score: 88, 
    total_marks: 100 
  },
];

export const Grading: React.FC = () => {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [gradingItem, setGradingItem] = useState<Submission | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const openGradingModal = (sub: Submission) => {
      setGradingItem(sub);
      setScoreInput(sub.score?.toString() || '');
      setFeedbackInput(sub.feedback || '');
  };

  const handleSaveGrade = () => {
      if (!gradingItem) return;
      
      setSubmissions(prev => prev.map(s => s.id === gradingItem.id ? { 
          ...s, 
          status: 'graded', 
          score: parseInt(scoreInput),
          feedback: feedbackInput
      } : s));
      
      setGradingItem(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Grading Dashboard</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assignment/Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Score</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {submissions.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{sub.student_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{sub.exam_title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sub.status === 'graded' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center w-fit">
                      <CheckCircle className="w-3 h-3 mr-1" /> Graded
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center w-fit">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  <span>{sub.score !== undefined ? `${sub.score}/${sub.total_marks}` : '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => openGradingModal(sub)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm px-3 py-1 bg-indigo-50 rounded-lg transition-colors"
                  >
                    View & Grade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grading Modal */}
      {gradingItem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">Grading: {gradingItem.student_name}</h3>
                      <button onClick={() => setGradingItem(null)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* Submission Info */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Assessment:</span>
                              <span className="font-medium">{gradingItem.exam_title}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Submitted:</span>
                              <span>{gradingItem.submitted_at}</span>
                          </div>
                          {gradingItem.file_url && (
                              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                                  <div className="flex items-center gap-2 text-sm text-slate-700">
                                      <FileText className="w-4 h-4 text-slate-400" />
                                      {gradingItem.file_url}
                                  </div>
                                  <button className="text-indigo-600 hover:underline text-xs font-medium flex items-center">
                                      <Download className="w-3 h-3 mr-1" /> Download
                                  </button>
                              </div>
                          )}
                      </div>

                      {/* Score Input */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Score (Max: {gradingItem.total_marks})</label>
                          <input 
                            type="number" 
                            value={scoreInput}
                            onChange={e => setScoreInput(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                      </div>

                      {/* Feedback */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Teacher Feedback</label>
                          <textarea 
                            value={feedbackInput}
                            onChange={e => setFeedbackInput(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                            placeholder="Enter constructive feedback..."
                          />
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                      <button 
                        onClick={() => setGradingItem(null)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveGrade}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" /> Save Grade
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
