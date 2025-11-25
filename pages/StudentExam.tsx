import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, ChevronRight, ChevronLeft, Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { Question } from '../types';

const mockQuestions: Question[] = [
  { id: 'q1', text: 'What is the value of Pi?', type: 'MCQ', options: ['3.12', '3.14', '3.16'], marks: 2, difficulty: 'Easy', subject: 'Math', tags: [], grade_level: 5 },
  { id: 'q2', text: 'Explain the theory of relativity.', type: 'ESSAY', marks: 10, difficulty: 'Hard', subject: 'Physics', tags: [], grade_level: 10 },
  { id: 'q3', text: 'Write a function to reverse a string.', type: 'CODE', marks: 10, difficulty: 'Medium', subject: 'CS', tags: [], grade_level: 8 }
];

export const StudentExam: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (val: string) => {
    setAnswers(prev => ({ ...prev, [mockQuestions[currentQuestionIndex].id]: val }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Mock API call
    setTimeout(() => {
      alert('Exam Submitted Successfully!');
      navigate('/dashboard');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Submission Received</h2>
          <p className="text-slate-500">Redirecting you to dashboard...</p>
        </div>
      </div>
    );
  }

  const question = mockQuestions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Mid-Term Assessment</h1>
          <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {mockQuestions.length}</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
          <Timer className="w-4 h-4 mr-2" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
            <div className="flex justify-between mb-4">
              <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{question.type}</span>
              <span className="text-sm font-medium text-slate-500">{question.marks} Marks</span>
            </div>
            
            <h2 className="text-xl font-medium text-slate-900 mb-6">{question.text}</h2>

            {/* Answer Inputs */}
            {question.type === 'MCQ' && (
              <div className="space-y-3">
                {question.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      answers[question.id] === opt 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'ESSAY' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={e => handleAnswer(e.target.value)}
                className="w-full h-64 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your answer here..."
              />
            )}

            {question.type === 'CODE' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={e => handleAnswer(e.target.value)}
                className="w-full h-64 p-4 border border-slate-200 rounded-lg font-mono bg-slate-900 text-green-400 focus:ring-2 focus:ring-indigo-500"
                placeholder="// Write your code here"
              />
            )}
          </div>

          <div className="flex justify-between">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            {currentQuestionIndex === mockQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {mockQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    currentQuestionIndex === idx
                      ? 'bg-indigo-600 text-white'
                      : answers[q.id]
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div> Answered</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-indigo-600 rounded mr-2"></div> Current</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-slate-100 rounded mr-2"></div> Not Visited</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};