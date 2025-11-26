
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, ChevronRight, ChevronLeft, Flag, CheckCircle, AlertTriangle, Bot, List, LayoutGrid, X, Star, Trophy, Zap } from 'lucide-react';
import { Question } from '../types';
import { AuthContext } from '../App';

const mockQuestions: Question[] = [
  { id: 'q1', text: 'What is the value of Pi?', type: 'MCQ', options: ['3.12', '3.14', '3.16'], marks: 2, difficulty: 'Easy', subject: 'Math', tags: [], grade_level: 5 },
  { id: 'q2', text: 'Explain the theory of relativity.', type: 'ESSAY', marks: 10, difficulty: 'Hard', subject: 'Physics', tags: [], grade_level: 10 },
  { id: 'q3', text: 'Write a function to reverse a string.', type: 'CODE', marks: 10, difficulty: 'Medium', subject: 'CS', tags: [], grade_level: 8 }
];

export const StudentExam: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  
  // Result state for display
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [examScore, setExamScore] = useState(0);

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
    // Mock Scoring Logic
    // In a real app, this would be server-side or checked against correct answers
    // Here we simulate a score between 60% and 100%
    const mockScore = Math.floor(Math.random() * 41) + 60; 
    setExamScore(mockScore);

    // Calculate Rewards
    const baseCoins = 50;
    const highScoreBonus = mockScore >= 80 ? 50 : 0;
    const perfectBonus = mockScore === 100 ? 50 : 0;
    
    const totalCoins = baseCoins + highScoreBonus + perfectBonus;
    const totalXP = 200 + (mockScore > 80 ? 100 : 0);

    setEarnedCoins(totalCoins);
    setEarnedXP(totalXP);

    if (user) {
        updateUser({
            coins: (user.coins || 0) + totalCoins,
            xp: (user.xp || 0) + totalXP
        });
    }
    setIsSubmitted(true);
  };

  const handleGetHint = () => {
      window.dispatchEvent(new CustomEvent('open-ai-tutor', { 
          detail: { context: `Exam Hint: ${mockQuestions[currentQuestionIndex].text}` } 
      }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] animate-in fade-in duration-500 p-4">
        <div className="text-center p-8 md:p-12 bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
             <Trophy className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Exam Submitted!</h2>
          <div className="mb-8">
              <span className="text-4xl font-extrabold text-indigo-600">{examScore}%</span>
              <p className="text-slate-500 text-sm">Score</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 transform transition-all hover:scale-105">
                  <p className="text-yellow-700 font-bold text-xs uppercase mb-1">Coins Earned</p>
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> +{earnedCoins}
                  </div>
                  {earnedCoins > 50 && <p className="text-[10px] text-yellow-600 font-bold mt-1">High Score Bonus!</p>}
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 transform transition-all hover:scale-105">
                  <p className="text-indigo-700 font-bold text-xs uppercase mb-1">XP Gained</p>
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
                      <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" /> +{earnedXP}
                  </div>
              </div>
          </div>

          <button 
            onClick={() => navigate('/student-dashboard')} 
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
              Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = mockQuestions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Mid-Term Assessment</h1>
          <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {mockQuestions.length}</p>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
            {/* Dropdown Navigation */}
            <div className="hidden sm:block">
                <select
                    value={currentQuestionIndex}
                    onChange={(e) => setCurrentQuestionIndex(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 outline-none cursor-pointer hover:bg-slate-100"
                >
                    {mockQuestions.map((q, idx) => (
                        <option key={q.id} value={idx}>Go to Question {idx + 1}</option>
                    ))}
                </select>
            </div>

            {/* Map Button */}
            <button 
                onClick={() => setIsGridOpen(true)}
                className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
                <LayoutGrid className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">View Map</span>
            </button>

            <button 
                onClick={handleGetHint}
                className="flex items-center px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
            >
                <Bot className="w-4 h-4 mr-1.5" /> Hint
            </button>
            <div className={`flex items-center px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                <Timer className="w-4 h-4 mr-2" />
                {formatTime(timeLeft)}
            </div>
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
              className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            {currentQuestionIndex === mockQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation (Desktop) */}
        <div className="space-y-4 hidden lg:block">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {mockQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    currentQuestionIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md'
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

      {/* Navigation Modal (Mobile/Tablets) */}
      {isGridOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg">Question Map</h3>
                    <button onClick={() => setIsGridOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                    {mockQuestions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => { setCurrentQuestionIndex(idx); setIsGridOpen(false); }}
                            className={`h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                                currentQuestionIndex === idx 
                                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200' 
                                : answers[q.id] 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                <div className="pt-2 text-xs text-slate-500 space-y-2 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center"><div className="w-3 h-3 bg-indigo-600 rounded mr-2"></div> Current Question</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div> Answered</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-slate-100 rounded mr-2"></div> Not Visited</div>
                </div>

                <button 
                    onClick={() => setIsGridOpen(false)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                    Return to Exam
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
