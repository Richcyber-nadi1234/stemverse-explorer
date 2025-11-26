
import React, { useState } from 'react';
import { CheckCircle, Clock, Eye, FileText, Download, X, MessageSquare, Save, Sparkles, Loader2 } from 'lucide-react';
import { Submission } from '../types';
import { mockQuestions } from './QuestionBank';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mockSubmissions: Submission[] = [
  { 
    id: 's1', 
    student_name: 'Kwame Mensah', 
    exam_title: 'CS: Python Functions', 
    submitted_at: '2023-10-10 10:30 AM', 
    status: 'pending', 
    total_marks: 15,
    file_url: 'assignment_code.py',
    feedback: '',
    questionId: 'q4', // Links to: "Write a Python function to calculate the factorial of a number."
    submissionContent: 'def factorial(n):\n  if n == 0:\n    return 1\n  else:\n    return n * factorial(n-1)'
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
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

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

  const handleGenerateFeedback = async () => {
      if (!gradingItem || !gradingItem.submissionContent || !gradingItem.questionId) return;
      
      setIsGeneratingFeedback(true);
      
      const question = mockQuestions.find(q => q.id === gradingItem.questionId);
      const questionText = question ? question.text : "Question text unavailable";
      const maxMarks = gradingItem.total_marks;

      const prompt = `
        You are an expert teacher grading a student's submission.
        
        Question: "${questionText}"
        Maximum Score: ${maxMarks}
        
        Student Submission:
        """
        ${gradingItem.submissionContent}
        """
        
        Please evaluate the submission based on accuracy, logic, and clarity.
        Provide a JSON response with:
        - suggestedScore: An integer representing the score out of ${maxMarks}.
        - positiveFeedback: A brief comment on what was done well.
        - improvementAreas: A brief comment on what could be improved.
      `;

      try {
          const response = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: prompt,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          suggestedScore: { type: Type.INTEGER },
                          positiveFeedback: { type: Type.STRING },
                          improvementAreas: { type: Type.STRING },
                      }
                  }
              }
          });

          if (response.text) {
              const result = JSON.parse(response.text);
              setScoreInput(result.suggestedScore.toString());
              setFeedbackInput(
                  `**AI Feedback Suggestion:**\n\n` +
                  `✅ **Strengths:** ${result.positiveFeedback}\n\n` +
                  `💡 **Improvements:** ${result.improvementAreas}`
              );
          }
      } catch (error) {
          console.error("AI Feedback Error:", error);
          alert("Failed to generate AI feedback. Please try again.");
      } finally {
          setIsGeneratingFeedback(false);
      }
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
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">Grading: {gradingItem.student_name}</h3>
                      <button onClick={() => setGradingItem(null)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto">
                      {/* Submission Info */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <span className="text-xs text-slate-500 uppercase font-bold">Assessment</span>
                              <p className="font-medium text-slate-900">{gradingItem.exam_title}</p>
                          </div>
                          <div>
                              <span className="text-xs text-slate-500 uppercase font-bold">Submitted</span>
                              <p className="font-medium text-slate-900">{gradingItem.submitted_at}</p>
                          </div>
                      </div>

                      {gradingItem.submissionContent && (
                          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Student Answer</h4>
                              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap bg-transparent overflow-x-auto">
                                  {gradingItem.submissionContent}
                              </pre>
                          </div>
                      )}

                      {gradingItem.file_url && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  {gradingItem.file_url}
                              </div>
                              <button className="text-indigo-600 hover:underline text-xs font-medium flex items-center">
                                  <Download className="w-3 h-3 mr-1" /> Download
                              </button>
                          </div>
                      )}

                      <div className="border-t border-slate-100 pt-6 space-y-4">
                          <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900">Feedback & Score</h4>
                              {gradingItem.submissionContent && (
                                  <button 
                                    onClick={handleGenerateFeedback}
                                    disabled={isGeneratingFeedback}
                                    className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors shadow-sm"
                                  >
                                      {isGeneratingFeedback ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                                      AI Feedback Suggestion
                                  </button>
                              )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-slate-700 mb-1">Feedback</label>
                                  <textarea 
                                    value={feedbackInput}
                                    onChange={e => setFeedbackInput(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32 text-sm"
                                    placeholder="Enter constructive feedback..."
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-1">Score (Max: {gradingItem.total_marks})</label>
                                  <input 
                                    type="number" 
                                    value={scoreInput}
                                    onChange={e => setScoreInput(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-center"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 mt-auto">
                      <button 
                        onClick={() => setGradingItem(null)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveGrade}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center"
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
    