
import React, { useState } from 'react';
import { Save, Plus, Trash, FileText, Video, GripVertical, Sparkles, Bot, X, Loader2, Check, Calendar, Award, AlertCircle, Image as ImageIcon, Film, Wand2, Play, Link as LinkIcon, Scissors, ListPlus } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Module {
  id: string;
  title: string;
  content?: string;
  contentType?: 'text' | 'video' | 'quiz' | 'assignment' | 'live_class';
  quizData?: QuizQuestion[];
  assignmentConfig?: {
    dueDate: string;
    maxScore: number;
    instructions?: string;
  };
  liveConfig?: {
    startTime: string;
    meetingLink: string;
    platform: 'zoom' | 'meet' | 'internal';
  };
}

export const CourseStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'media'>('curriculum');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState<Module[]>([]);

  // AI Modal State (Text Generation)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingQuestionFor, setGeneratingQuestionFor] = useState<string | null>(null); // Track specific module for quick quiz gen
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    type: 'text',
    audience: 'beginner',
    tone: 'fun',
    length: 'medium',
    complexity: 'intermediate',
    keywords: '',
    quizCount: 5,
    quizDifficulty: 'medium'
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedQuizData, setGeneratedQuizData] = useState<QuizQuestion[]>([]);
  const [showToast, setShowToast] = useState(false); 

  // AI Media Tools State
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaImage, setMediaImage] = useState<File | null>(null);
  const [mediaResult, setMediaResult] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaMode, setMediaMode] = useState<'veo' | 'edit' | 'video_analysis'>('veo');
  const [analysisVideo, setAnalysisVideo] = useState<File | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<string | null>(null);

  const addModule = () => {
    setModules([...modules, { 
      id: Date.now().toString(), 
      title: '', 
      content: '',
      contentType: 'text',
      quizData: [],
      assignmentConfig: { dueDate: '', maxScore: 100, instructions: '' },
      liveConfig: { startTime: '', meetingLink: '', platform: 'internal' }
    }]);
  };

  const updateModule = (id: string, field: keyof Module, val: any) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: val } : m));
  };
  
  const updateAssignmentConfig = (id: string, field: 'dueDate' | 'maxScore' | 'instructions', val: any) => {
    setModules(modules.map(m => m.id === id ? { 
      ...m, 
      assignmentConfig: { ...m.assignmentConfig!, [field]: val } 
    } : m));
  };

  const updateLiveConfig = (id: string, field: 'startTime' | 'meetingLink' | 'platform', val: any) => {
    setModules(modules.map(m => m.id === id ? { 
      ...m, 
      liveConfig: { ...m.liveConfig!, [field]: val } 
    } : m));
  };

  const addQuizQuestion = (moduleId: string) => {
      const newQuestion: QuizQuestion = {
          id: Date.now().toString(),
          question: '',
          options: ['', '', '', ''],
          correctAnswer: ''
      };
      setModules(prev => prev.map(m => {
          if (m.id === moduleId) {
              return { ...m, quizData: [...(m.quizData || []), newQuestion] };
          }
          return m;
      }));
  };

  const updateQuizQuestion = (moduleId: string, questionId: string, field: keyof QuizQuestion, val: any) => {
      setModules(prev => prev.map(m => {
          if (m.id === moduleId) {
              return {
                  ...m,
                  quizData: m.quizData?.map(q => q.id === questionId ? { ...q, [field]: val } : q)
              };
          }
          return m;
      }));
  };

  const deleteQuizQuestion = (moduleId: string, questionId: string) => {
      setModules(prev => prev.map(m => {
          if (m.id === moduleId) {
              return {
                  ...m,
                  quizData: m.quizData?.filter(q => q.id !== questionId)
              };
          }
          return m;
      }));
  };

  const deleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const handleSave = () => {
    alert('Course Saved Successfully!');
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    // Prevent dragging if interacting with inputs to allow text selection
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData("dragIndex", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData("dragIndex");
    if (!dragIndexStr) return;
    
    const dragIndex = parseInt(dragIndexStr);
    if (dragIndex === dropIndex) return;

    const newModules = [...modules];
    const [movedItem] = newModules.splice(dragIndex, 1);
    newModules.splice(dropIndex, 0, movedItem);
    setModules(newModules);
  };

  // --- AI HANDLERS ---

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleVeoGenerate = async () => {
    if (!mediaImage) return alert("Please upload an image first.");
    setMediaLoading(true);
    setMediaResult(null);

    try {
      const base64Image = await blobToBase64(mediaImage);
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: mediaPrompt || "Animate this scene naturally",
        image: {
          imageBytes: base64Image,
          mimeType: mediaImage.type
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p', // 1080p also supported
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setMediaResult(`${downloadLink}&key=${process.env.API_KEY}`);
      } else {
        alert("Video generation failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating video");
    } finally {
      setMediaLoading(false);
    }
  };

  const handleImageEdit = async () => {
    if (!mediaImage || !mediaPrompt) return alert("Image and instruction required.");
    setMediaLoading(true);
    setMediaResult(null);

    try {
      const base64Image = await blobToBase64(mediaImage);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mediaImage.type,
              },
            },
            { text: mediaPrompt },
          ],
        },
      });

      // Find image part
      let foundImage = false;
      for (const part of response.candidates![0].content.parts) {
        if (part.inlineData) {
          setMediaResult(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      if (!foundImage && response.text) {
          alert("Model returned text instead of image: " + response.text);
      }
    } catch (e) {
      console.error(e);
      alert("Error editing image");
    } finally {
      setMediaLoading(false);
    }
  };

  const handleVideoAnalysis = async () => {
    if (!analysisVideo) return alert("Please select a video.");
    setMediaLoading(true);
    setMediaResult(null);
    setEditSuggestions(null);

    try {
      const base64Video = await blobToBase64(analysisVideo);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: analysisVideo.type,
                data: base64Video
              }
            },
            { text: "Analyze this video. Please provide: 1. A concise summary. 2. Key learning points. 3. A suggested 'Edit Decision List' (EDL) with timestamps to cut silence or improve pacing." }
          ]
        }
      });

      const text = response.text || "No analysis generated.";
      // Simple heuristic to split analysis from EDL suggestions for the UI
      if (text.includes('Edit Decision List')) {
          const parts = text.split('Edit Decision List');
          setMediaResult(parts[0]);
          setEditSuggestions("Edit Decision List" + parts[1]);
      } else {
          setMediaResult(text);
      }
    } catch (e) {
        console.error(e);
        alert("Error analyzing video. Ensure it is under 20MB for this demo.");
    } finally {
        setMediaLoading(false);
    }
  };

  // --- TEXT GEN HANDLERS ---
  const openAIModal = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setAiConfig({ 
        topic: '', 
        type: 'text', 
        audience: 'beginner', 
        tone: 'fun', 
        length: 'medium',
        complexity: 'intermediate',
        keywords: '',
        quizCount: 5, 
        quizDifficulty: 'medium' 
    });
    setGeneratedContent('');
    setGeneratedQuizData([]);
    setIsAIModalOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!aiConfig.topic) return;
    setIsGenerating(true);
    setGeneratedQuizData([]);
    setGeneratedContent('');
    
    try {
        if (aiConfig.type === 'quiz') {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate ${aiConfig.quizCount} quiz questions about ${aiConfig.topic} for ${aiConfig.audience}. Difficulty: ${aiConfig.quizDifficulty}.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            if (response.text) {
                const data = JSON.parse(response.text);
                setGeneratedQuizData(data.map((q: any) => ({ ...q, id: Date.now().toString() + Math.random() })));
            }
        } else {
            const prompt = `Generate a ${aiConfig.length} ${aiConfig.type} module for a course.
            Topic: ${aiConfig.topic}.
            Target Audience: ${aiConfig.audience}.
            Tone: ${aiConfig.tone}.
            Complexity: ${aiConfig.complexity}.
            ${aiConfig.keywords ? `Keywords to include: ${aiConfig.keywords}.` : ''}
            Format appropriately with headings and bullet points.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            setGeneratedContent(response.text || "Failed to generate content.");
        }
    } catch (error) {
        console.error(error);
        setGeneratedContent("Error connecting to AI.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleQuickAiQuizQuestion = async (moduleId: string) => {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;
      const topic = module.title || "General Knowledge";
      
      setGeneratingQuestionFor(moduleId);

      try {
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Generate 1 multiple choice quiz question about "${topic}" suitable for a curriculum module.`,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          question: { type: Type.STRING },
                          options: { type: Type.ARRAY, items: { type: Type.STRING } },
                          correctAnswer: { type: Type.STRING }
                      }
                  }
              }
          });
          
          if (response.text) {
              const q = JSON.parse(response.text);
              const newQuestion: QuizQuestion = {
                  id: Date.now().toString() + Math.random(),
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer
              };
               setModules(prev => prev.map(m => {
                  if (m.id === moduleId) {
                      return { ...m, quizData: [...(m.quizData || []), newQuestion] };
                  }
                  return m;
              }));
          }
      } catch (e) {
          console.error(e);
          alert("Failed to generate question. Please try again.");
      } finally {
          setGeneratingQuestionFor(null);
      }
  };

  const applyAIContent = () => {
    if (activeModuleId) {
        if (generatedQuizData.length > 0) {
            // Append generated questions to existing
            setModules(prev => prev.map(m => {
                if (m.id === activeModuleId) {
                    return { ...m, contentType: 'quiz', quizData: [...(m.quizData || []), ...generatedQuizData] };
                }
                return m;
            }));
        } else if (generatedContent) {
            updateModule(activeModuleId, 'content', generatedContent);
        }
        setIsAIModalOpen(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-20 px-4 sm:px-0">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-[100] bg-slate-800 border-l-4 border-green-500 text-white p-4 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-right-5">
           <Check className="w-5 h-5 text-green-400 mr-3" />
           <div>
              <h4 className="text-sm font-bold text-green-400">Success</h4>
              <p className="text-xs text-slate-300">Content generated and applied.</p>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Creator Studio</h1>
          <p className="text-slate-500">Drafting new content: {title || 'Untitled'}</p>
        </div>
        <button onClick={handleSave} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 w-full sm:w-auto justify-center">
          <Save className="w-4 h-4 mr-2" /> Save Draft
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 px-2 font-bold text-sm whitespace-nowrap ${activeTab === 'curriculum' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
              Curriculum Builder
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={`pb-3 px-2 font-bold text-sm whitespace-nowrap flex items-center gap-2 ${activeTab === 'media' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
              <Wand2 className="w-4 h-4" /> AI Media Tools
          </button>
      </div>

      {activeTab === 'curriculum' && (
        <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" 
                    placeholder="e.g. Advanced Biology 101"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" 
                    placeholder="Course overview..."
                />
                </div>
            </div>

            <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Curriculum</h3>
                <button onClick={addModule} className="text-indigo-600 text-sm font-bold flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Module
                </button>
                </div>
                
                {modules.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    No modules added yet.
                </div>
                )}

                {modules.map((mod, idx) => (
                <div 
                    key={mod.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-4 group shadow-sm hover:shadow-md transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 cursor-move">
                            <GripVertical className="text-slate-300 shrink-0" />
                            <span className="font-mono text-slate-400 font-bold text-sm shrink-0">{idx + 1}.</span>
                            <input 
                                value={mod.title}
                                onChange={e => updateModule(mod.id, 'title', e.target.value)}
                                className="flex-1 p-2 border-none focus:ring-0 font-medium text-slate-900 placeholder-slate-400 text-lg bg-white min-w-0"
                                placeholder="Module Title"
                            />
                        </div>
                        <div className="flex gap-2 justify-end sm:justify-start">
                            <button 
                            onClick={() => openAIModal(mod.id)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                            title="Generate content with AI"
                            >
                            <Sparkles className="w-3 h-3 mr-1.5" /> AI Generate
                            </button>
                            <button onClick={() => deleteModule(mod.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash className="w-4 h-4" /></button>
                        </div>
                    </div>
                    
                    <div className="sm:ml-12 sm:mr-4 space-y-3">
                    {/* Type Selector */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input 
                            type="radio" 
                            name={`type-${mod.id}`}
                            checked={mod.contentType === 'text'}
                            onChange={() => updateModule(mod.id, 'contentType', 'text')}
                            className="text-indigo-600 focus:ring-indigo-500"
                        /> Text/Video
                        </label>
                        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input 
                            type="radio" 
                            name={`type-${mod.id}`}
                            checked={mod.contentType === 'quiz'}
                            onChange={() => updateModule(mod.id, 'contentType', 'quiz')}
                            className="text-indigo-600 focus:ring-indigo-500"
                        /> Quiz
                        </label>
                        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input 
                            type="radio" 
                            name={`type-${mod.id}`}
                            checked={mod.contentType === 'assignment'}
                            onChange={() => updateModule(mod.id, 'contentType', 'assignment')}
                            className="text-indigo-600 focus:ring-indigo-500"
                        /> Assignment
                        </label>
                        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input 
                            type="radio" 
                            name={`type-${mod.id}`}
                            checked={mod.contentType === 'live_class'}
                            onChange={() => updateModule(mod.id, 'contentType', 'live_class')}
                            className="text-indigo-600 focus:ring-indigo-500"
                        /> <Video className="w-4 h-4" /> Live Class
                        </label>
                    </div>

                    {/* STRUCTURED QUIZ EDITOR */}
                    {mod.contentType === 'quiz' && (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center"><ListPlus className="w-4 h-4 mr-2" /> Quiz Questions</h4>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleQuickAiQuizQuestion(mod.id)}
                                        disabled={generatingQuestionFor === mod.id}
                                        className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 font-bold hover:bg-purple-100 flex items-center"
                                    >
                                        {generatingQuestionFor === mod.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                        AI Add Question
                                    </button>
                                    <button onClick={() => addQuizQuestion(mod.id)} className="text-xs text-indigo-600 font-bold hover:underline">+ Add Manual</button>
                                </div>
                            </div>
                            
                            {(!mod.quizData || mod.quizData.length === 0) ? (
                                <div className="text-center py-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg text-sm">
                                    No questions yet. Use AI Generate or add manually.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {mod.quizData.map((q, qIdx) => (
                                        <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-3 relative group">
                                            <button onClick={() => deleteQuizQuestion(mod.id, q.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="mb-2 pr-6">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Question {qIdx + 1}</label>
                                                <input 
                                                    value={q.question}
                                                    onChange={(e) => updateQuizQuestion(mod.id, q.id, 'question', e.target.value)}
                                                    className="w-full p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="Enter question text..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + optIdx)}</span>
                                                        <input 
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOptions = [...q.options];
                                                                newOptions[optIdx] = e.target.value;
                                                                updateQuizQuestion(mod.id, q.id, 'options', newOptions);
                                                            }}
                                                            className={`w-full p-1.5 text-xs border rounded outline-none focus:border-indigo-500 ${opt === q.correctAnswer && opt !== '' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-white border-slate-200'}`}
                                                            placeholder={`Option ${optIdx + 1}`}
                                                        />
                                                        <input 
                                                            type="radio" 
                                                            name={`correct-${q.id}`}
                                                            checked={q.correctAnswer === opt && opt !== ''}
                                                            onChange={() => updateQuizQuestion(mod.id, q.id, 'correctAnswer', opt)}
                                                            className="text-green-600 focus:ring-green-500"
                                                            title="Mark as correct answer"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assignment Config */}
                    {mod.contentType === 'assignment' && (
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Due Date</label>
                                    <input 
                                        type="date"
                                        value={mod.assignmentConfig?.dueDate || ''}
                                        onChange={e => updateAssignmentConfig(mod.id, 'dueDate', e.target.value)}
                                        className="w-full p-2 text-sm border rounded bg-white text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Max Points</label>
                                    <input 
                                        type="number"
                                        value={mod.assignmentConfig?.maxScore || 100}
                                        onChange={e => updateAssignmentConfig(mod.id, 'maxScore', parseInt(e.target.value))}
                                        className="w-full p-2 text-sm border rounded bg-white text-slate-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Instructions</label>
                                <textarea 
                                    value={mod.assignmentConfig?.instructions || ''}
                                    onChange={e => updateAssignmentConfig(mod.id, 'instructions', e.target.value)}
                                    className="w-full p-3 text-sm border rounded-lg bg-white text-slate-900 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Describe the assignment requirements, formatting, and submission details..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Live Class Scheduler Config */}
                    {mod.contentType === 'live_class' && (
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-indigo-800 mb-1 uppercase">Schedule Date & Time</label>
                                    <input 
                                        type="datetime-local"
                                        value={mod.liveConfig?.startTime || ''}
                                        onChange={e => updateLiveConfig(mod.id, 'startTime', e.target.value)}
                                        className="w-full p-2 text-sm border border-indigo-200 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-indigo-800 mb-1 uppercase">Platform Provider</label>
                                    <select 
                                        value={mod.liveConfig?.platform || 'internal'}
                                        onChange={e => updateLiveConfig(mod.id, 'platform', e.target.value)}
                                        className="w-full p-2 text-sm border border-indigo-200 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="internal">Internal Classroom (Built-in)</option>
                                        <option value="zoom">Zoom Meeting</option>
                                        <option value="meet">Google Meet</option>
                                    </select>
                                </div>
                            </div>
                            
                            {(mod.liveConfig?.platform === 'zoom' || mod.liveConfig?.platform === 'meet') && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-indigo-800 mb-1 uppercase">Meeting URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                        <input 
                                            type="url"
                                            value={mod.liveConfig?.meetingLink || ''}
                                            onChange={e => updateLiveConfig(mod.id, 'meetingLink', e.target.value)}
                                            placeholder={mod.liveConfig?.platform === 'zoom' ? "https://zoom.us/j/..." : "https://meet.google.com/..."}
                                            className="w-full pl-10 p-2 text-sm border border-indigo-200 rounded bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-indigo-500 mt-1">Students will be directed to this external link.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {mod.contentType === 'text' && (
                        <textarea 
                            value={mod.content}
                            onChange={e => updateModule(mod.id, 'content', e.target.value)}
                            className="w-full p-3 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[80px]"
                            placeholder="Enter module text content, lecture notes, or video script..."
                        />
                    )}
                    </div>
                </div>
                ))}
            </div>
        </>
      )}

      {/* AI Media Studio Tab */}
      {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setMediaMode('veo')}
                    className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${mediaMode === 'veo' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white hover:border-indigo-300'}`}
                  >
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Film className="w-5 h-5" /></div>
                      <div>
                          <h4 className="font-bold text-sm">Animate Image (Veo)</h4>
                          <p className="text-xs text-slate-500">Turn photos into videos</p>
                      </div>
                  </button>
                  <button 
                    onClick={() => setMediaMode('edit')}
                    className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${mediaMode === 'edit' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white hover:border-indigo-300'}`}
                  >
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Wand2 className="w-5 h-5" /></div>
                      <div>
                          <h4 className="font-bold text-sm">Image Editor</h4>
                          <p className="text-xs text-slate-500">Edit with text instructions</p>
                      </div>
                  </button>
                  <button 
                    onClick={() => setMediaMode('video_analysis')}
                    className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${mediaMode === 'video_analysis' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white hover:border-indigo-300'}`}
                  >
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Scissors className="w-5 h-5" /></div>
                      <div>
                          <h4 className="font-bold text-sm">AI Video Analysis</h4>
                          <p className="text-xs text-slate-500">Get editing suggestions</p>
                      </div>
                  </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8">
                  {/* Inputs */}
                  <div className="flex-1 space-y-4">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">
                          {mediaMode === 'veo' ? 'Generate Video from Image' : mediaMode === 'edit' ? 'Edit Image with AI' : 'Analyze & Edit Video'}
                      </h3>
                      
                      {mediaMode !== 'video_analysis' ? (
                          <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Source Image</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setMediaImage(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {mediaImage ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium truncate">
                                            <Check className="w-5 h-5 shrink-0" /> {mediaImage.name}
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 text-sm">
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                            <p>Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Prompt Instruction</label>
                                <textarea 
                                    value={mediaPrompt}
                                    onChange={(e) => setMediaPrompt(e.target.value)}
                                    className="w-full p-3 border rounded-lg h-24 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                    placeholder={mediaMode === 'veo' ? "e.g. Animate this character waving hello..." : "e.g. Make it look like a pencil sketch..."}
                                />
                                {mediaMode === 'edit' && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['Remove Background', 'Cyberpunk Style', 'Pencil Sketch', 'Fix Lighting', 'Remove Object'].map(action => (
                                            <button 
                                                key={action}
                                                onClick={() => setMediaPrompt(action)}
                                                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 rounded border border-slate-200 transition-colors"
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={mediaMode === 'veo' ? handleVeoGenerate : handleImageEdit}
                                disabled={mediaLoading || !mediaImage}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {mediaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {mediaMode === 'veo' ? 'Generate Video' : 'Edit Image'}
                            </button>
                          </>
                      ) : (
                          <>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Source Video</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept="video/*"
                                        onChange={(e) => setAnalysisVideo(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {analysisVideo ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium truncate">
                                            <Check className="w-5 h-5 shrink-0" /> {analysisVideo.name}
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 text-sm">
                                            <Video className="w-8 h-8 mx-auto mb-2" />
                                            <p>Click to upload video (Max 20MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 mb-4">
                                <p className="font-bold mb-1">Features:</p>
                                <ul className="list-disc list-inside">
                                    <li>Analyze content summaries</li>
                                    <li>Generate Edit Decision Lists (EDL)</li>
                                    <li>Suggest cuts for silence or pacing</li>
                                </ul>
                            </div>
                            <button 
                                onClick={handleVideoAnalysis}
                                disabled={mediaLoading || !analysisVideo}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {mediaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                                Analyze & Suggest Edits
                            </button>
                          </>
                      )}
                  </div>

                  {/* Output Preview */}
                  <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center min-h-[300px] p-4 relative overflow-hidden">
                      {mediaLoading ? (
                          <div className="text-center text-slate-500">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                              <p>{mediaMode === 'veo' ? 'Generating frames... (may take a minute)' : 'Processing with Gemini...'}</p>
                          </div>
                      ) : mediaResult ? (
                          mediaMode === 'veo' ? (
                              <video src={mediaResult} controls className="w-full h-full object-contain rounded-lg" />
                          ) : mediaMode === 'edit' ? (
                              <img src={mediaResult} alt="Edited" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                              <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm max-h-[50%] overflow-y-auto">
                                      <h4 className="font-bold text-slate-900 mb-1 sticky top-0 bg-white">Analysis Summary</h4>
                                      <p className="whitespace-pre-wrap text-slate-600">{mediaResult}</p>
                                  </div>
                                  {editSuggestions && (
                                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-sm flex-1 overflow-y-auto custom-scrollbar">
                                          <h4 className="font-bold text-slate-200 mb-1 sticky top-0 bg-slate-800 flex items-center"><Scissors className="w-3 h-3 mr-2 text-amber-400" /> Editing Suggestions</h4>
                                          <div className="prose prose-invert prose-sm">
                                              <p className="whitespace-pre-wrap text-slate-300 font-mono text-xs">{editSuggestions}</p>
                                          </div>
                                      </div>
                                  )}
                                  <div className="mt-auto pt-2">
                                      <button
                                          onClick={() => {
                                              setModules(prev => [...prev, {
                                                  id: Date.now().toString(),
                                                  title: `Video Analysis: ${analysisVideo?.name || 'Upload'}`,
                                                  contentType: 'video',
                                                  content: `**Analysis Summary:**\n${mediaResult}\n\n**Suggested Edits:**\n${editSuggestions || 'None'}`,
                                                  quizData: [],
                                                  assignmentConfig: { dueDate: '', maxScore: 100 },
                                                  liveConfig: { startTime: '', meetingLink: '', platform: 'internal' }
                                              }]);
                                              setActiveTab('curriculum');
                                              alert("Module created from video analysis!");
                                          }}
                                          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center shadow-sm"
                                      >
                                          <Plus className="w-4 h-4 mr-2" /> Create Module from This
                                      </button>
                                  </div>
                              </div>
                          )
                      ) : (
                          <div className="text-slate-400 text-sm text-center">
                              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              AI Output will appear here
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* AI Content Generator Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <h3 className="text-lg font-bold">AI Content Assistant</h3>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!generatedContent && generatedQuizData.length === 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Topic</label>
                    <input 
                      value={aiConfig.topic}
                      onChange={e => setAiConfig({...aiConfig, topic: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                      placeholder="e.g. Photosynthesis, Python Loops..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                      <select 
                        value={aiConfig.type}
                        onChange={e => setAiConfig({...aiConfig, type: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                      >
                        <option value="text">Lesson Note (Text)</option>
                        <option value="video">Video Script</option>
                        <option value="quiz">Quiz Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                      <select 
                        value={aiConfig.audience}
                        onChange={e => setAiConfig({...aiConfig, audience: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                      >
                        <option value="beginner">Beginner (Grade 1-5)</option>
                        <option value="intermediate">Intermediate (Grade 6-9)</option>
                        <option value="advanced">Advanced (Grade 10+)</option>
                      </select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Complexity</label>
                      <select 
                        value={aiConfig.complexity}
                        onChange={e => setAiConfig({...aiConfig, complexity: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                      >
                        <option value="basic">Basic Overview</option>
                        <option value="intermediate">Detailed Explanation</option>
                        <option value="advanced">In-depth Analysis</option>
                      </select>
                    </div>
                    {aiConfig.type !== 'quiz' ? (
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Length</label>
                        <select 
                            value={aiConfig.length}
                            onChange={e => setAiConfig({...aiConfig, length: e.target.value})}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        >
                            <option value="short">Short (Summary)</option>
                            <option value="medium">Medium (Standard)</option>
                            <option value="long">Long (Comprehensive)</option>
                        </select>
                        </div>
                    ) : (
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Count</label>
                        <select 
                            value={aiConfig.quizCount}
                            onChange={e => setAiConfig({...aiConfig, quizCount: parseInt(e.target.value)})}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        >
                            <option value={3}>3 Questions</option>
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                        </select>
                        </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (Optional)</label>
                    <input 
                      value={aiConfig.keywords}
                      onChange={e => setAiConfig({...aiConfig, keywords: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                      placeholder="e.g. gravity, acceleration, newton"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiConfig.topic}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 text-amber-400" /> Generate {aiConfig.type === 'quiz' ? 'Quiz' : 'Lesson'}</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-700">Preview</h4>
                    <button onClick={() => { setGeneratedContent(''); setGeneratedQuizData([]); }} className="text-xs text-indigo-600 hover:underline">Generate Different</button>
                  </div>
                  
                  {generatedQuizData.length > 0 ? (
                      <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
                          {generatedQuizData.map((q, i) => (
                              <div key={i} className="bg-white p-3 rounded border border-slate-100 text-sm">
                                  <p className="font-bold text-slate-800 mb-2">{i+1}. {q.question}</p>
                                  <ul className="space-y-1 pl-4 list-disc text-slate-600">
                                      {q.options.map((o, idx) => (
                                          <li key={idx} className={o === q.correctAnswer ? 'text-green-600 font-medium' : ''}>{o}</li>
                                      ))}
                                  </ul>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <textarea 
                        value={generatedContent}
                        onChange={e => setGeneratedContent(e.target.value)}
                        className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:ring-indigo-500 min-h-[200px]"
                      />
                  )}
                </div>
              )}
            </div>

            {(generatedContent || generatedQuizData.length > 0) && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsAIModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
                <button 
                  onClick={applyAIContent}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" /> Insert Content
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
