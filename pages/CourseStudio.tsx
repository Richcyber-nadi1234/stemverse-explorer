import React, { useState, useContext, useEffect } from 'react';
import { Save, Plus, Trash, FileText, Video, GripVertical, Sparkles, Bot, X, Loader2, Check, Calendar, Award, AlertCircle, Image as ImageIcon, Film, Wand2, Play, Link as LinkIcon, Scissors, ListPlus, Upload, LayoutTemplate, Send } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { CourseContext } from '../contexts/CourseContext';
import { ToastContext } from '../contexts/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Course, Module, QuizQuestion } from '../types';

// AI now handled server-side via backend endpoints; no browser API key needed.

export const CourseStudio: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { addCourse, updateCourse, courses } = useContext(CourseContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'curriculum' | 'media'>('curriculum');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [dragOverModuleIndex, setDragOverModuleIndex] = useState<number | null>(null);

  // AI Modal State (Text Generation & Planning)
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
    quizDifficulty: 'medium',
    objectives: '',
    moduleCount: 5,
    additionalContext: ''
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedQuizData, setGeneratedQuizData] = useState<QuizQuestion[]>([]);
  const [generatedOutline, setGeneratedOutline] = useState<{title: string, description: string}[]>([]);

  // AI Media Tools State
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaImage, setMediaImage] = useState<File | null>(null);
  const [mediaResult, setMediaResult] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaMode, setMediaMode] = useState<'veo' | 'edit' | 'video_analysis'>('veo');
  const [analysisVideo, setAnalysisVideo] = useState<File | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<string | null>(null);

  // Initialize for Editing if ID present
  useEffect(() => {
    if (location.state?.courseId) {
        const courseToEdit = courses.find(c => c.id === location.state.courseId);
        if (courseToEdit) {
            setEditingId(courseToEdit.id);
            setTitle(courseToEdit.title);
            setDescription(courseToEdit.description);
            setThumbnail(courseToEdit.thumbnail);
            setModules(courseToEdit.modules || []);
        }
    }
  }, [location.state, courses]);

  const addModule = () => {
    const newModuleId = Date.now().toString();
    setModules([...modules, { 
      id: newModuleId, 
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
    if (!title) {
        showToast('Please enter a course title.', 'error');
        return;
    }
    
    // Preserve existing course fields if editing, override with form data
    const existingCourse: Partial<Course> = editingId ? (courses.find(c => c.id === editingId) || {}) : {};

    const courseData: Course = {
        ...existingCourse, // Spread existing properties to keep enrolled students, rating etc.
        id: editingId || `course_${Date.now()}`,
        title,
        description: description || 'No description provided.',
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400',
    instructor: existingCourse.instructor || user?.first_name || 'Instructor',
        progress: existingCourse.progress || 0,
        total_lessons: modules.length,
        completed_lessons: existingCourse.completed_lessons || 0,
        category: existingCourse.category || 'General',
        tags: existingCourse.tags || [],
        students_enrolled: existingCourse.students_enrolled || 0,
        rating: existingCourse.rating || 0,
        status: 'pending_review', // ALWAYS submit to pending review, even if editing
        modules: modules
    } as Course;

    if (editingId) {
        updateCourse(courseData);
        showToast('Course updates submitted for review.', 'success');
    } else {
        addCourse(courseData);
        showToast('Course submitted for review.', 'success');
    }
    navigate('/instructor/courses');
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setThumbnail(imageUrl);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        e.preventDefault();
        return;
    }
    setDraggedModuleIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedModuleIndex === null || draggedModuleIndex === index) return;
    if (dragOverModuleIndex !== index) {
        setDragOverModuleIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedModuleIndex === null) return;
    if (draggedModuleIndex !== dropIndex) {
        const newModules = [...modules];
        const [movedItem] = newModules.splice(draggedModuleIndex, 1);
        newModules.splice(dropIndex, 0, movedItem);
        setModules(newModules);
    }
    setDraggedModuleIndex(null);
    setDragOverModuleIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedModuleIndex(null);
    setDragOverModuleIndex(null);
  };

  // AI Media Handlers
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleVeoGenerate = async () => {
    if (!mediaImage && !mediaPrompt) return alert("Please provide a text prompt or upload an image.");
    setMediaLoading(true);
    setMediaResult(null);
    try {
      // Prepare optional image payload
      let base64Image = undefined;
      if (mediaImage) {
          base64Image = await blobToBase64(mediaImage);
      }
      const prompt = mediaPrompt || (base64Image ? "Animate this scene naturally" : "A stunning educational video");
      const { data } = await api.post('/ai/video', {
        prompt,
        imageBase64: base64Image || undefined,
        imageMimeType: base64Image ? mediaImage!.type : undefined,
        resolution: '720p',
        aspectRatio: '16:9'
      });
      const downloadLink = data?.uri;
      if (downloadLink) {
        setMediaResult(downloadLink);
      } else {
        alert('Video generation failed.');
      }
    } catch (e: any) {
      console.error(e);
      if (e.toString().includes("Requested entity was not found")) {
          // @ts-ignore
          if (window.aistudio && window.aistudio.openSelectKey) {
             alert("API Key invalid or expired. Please select a valid key.");
             // @ts-ignore
             await window.aistudio.openSelectKey();
          }
      } else {
          alert("Error generating video: " + e.message);
      }
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
      const { data } = await api.post('/ai/image-edit', {
        imageBase64: base64Image,
        imageMimeType: mediaImage.type,
        prompt: mediaPrompt,
      });
      setMediaResult(`data:image/png;base64,${data?.imageBase64}`);
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
      const { data } = await api.post('/ai/video-analysis', {
        videoBase64: base64Video,
        mimeType: analysisVideo.type,
      });
      const text = data?.text || 'No analysis generated.';
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

  const openAIModal = (moduleId: string | null) => {
    const moduleTitle = moduleId ? modules.find(m => m.id === moduleId)?.title || '' : '';
    setActiveModuleId(moduleId);
    setAiConfig({ 
        topic: moduleTitle, 
        type: moduleId ? 'text' : 'outline', 
        audience: 'beginner', 
        tone: 'fun', 
        length: 'medium',
        complexity: 'intermediate',
        keywords: '',
        quizCount: 5, 
        quizDifficulty: 'medium',
        objectives: '',
        moduleCount: 5,
        additionalContext: ''
    });
    setGeneratedContent('');
    setGeneratedQuizData([]);
    setGeneratedOutline([]);
    setIsAIModalOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!aiConfig.topic) return;
    setIsGenerating(true);
    setGeneratedQuizData([]);
    setGeneratedContent('');
    setGeneratedOutline([]);
    try {
      if (aiConfig.type === 'outline') {
        const { data } = await api.post('/ai/outline', {
          topic: aiConfig.topic,
          moduleCount: aiConfig.moduleCount,
          audience: aiConfig.audience,
          objectives: aiConfig.objectives,
          additionalContext: aiConfig.additionalContext,
        });
        setGeneratedOutline(data?.outline || []);
      } else if (aiConfig.type === 'quiz') {
        const { data } = await api.post('/ai/quiz', {
          topic: aiConfig.topic,
          quizCount: aiConfig.quizCount,
          audience: aiConfig.audience,
          quizDifficulty: aiConfig.quizDifficulty,
        });
        const qs = data?.quiz || [];
        setGeneratedQuizData(qs.map((q: any) => ({ ...q, id: Date.now().toString() + Math.random() })));
      } else {
        const prompt = `Generate a ${aiConfig.length} ${aiConfig.type} module for a course.
        Topic: ${aiConfig.topic}.
        Target Audience: ${aiConfig.audience}.
        Tone: ${aiConfig.tone}.
        Complexity: ${aiConfig.complexity}.
        ${aiConfig.keywords ? `Key concepts to cover: ${aiConfig.keywords}.` : ''}
        Format appropriately with headings, bullet points, and clear paragraphs.`;
        const { data } = await api.post('/ai/chat', { text: prompt, fast: true });
        setGeneratedContent(data?.text || 'Failed to generate content.');
      }
    } catch (error) {
      console.error(error);
      setGeneratedContent('Error connecting to AI.');
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
          const { data } = await api.post('/ai/quiz', {
            topic,
            quizCount: 1,
            audience: aiConfig.audience,
            quizDifficulty: aiConfig.quizDifficulty,
          });
          const q = (data?.quiz || [])[0];
          if (q) {
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
    if (generatedOutline.length > 0) {
        const newModules = generatedOutline.map(item => ({
            id: Date.now().toString() + Math.random(),
            title: item.title,
            content: item.description,
            contentType: 'text' as const,
            quizData: [],
            assignmentConfig: { dueDate: '', maxScore: 100, instructions: '' },
            liveConfig: { startTime: '', meetingLink: '', platform: 'internal' as const }
        }));
        setModules(prev => [...prev, ...newModules]);
        setIsAIModalOpen(false);
        showToast('Content generated and applied.', 'success');
        return;
    }
    if (activeModuleId) {
        if (generatedQuizData.length > 0) {
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
        showToast('Content generated and applied.', 'success');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-20 px-4 sm:px-0">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Creator Studio</h1>
          <p className="text-slate-500">{editingId ? `Editing: ${title}` : `Drafting new content: ${title || 'Untitled'}`}</p>
        </div>
        <button onClick={handleSave} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 w-full sm:w-auto justify-center shadow-lg transition-colors">
          <Send className="w-4 h-4 mr-2" /> {editingId ? 'Save & Resubmit' : 'Submit for Review'}
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
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Course Thumbnail</label>
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="relative group shrink-0">
                            <div className={`w-full sm:w-72 aspect-video rounded-xl border-2 ${thumbnail ? 'border-slate-200' : 'border-dashed border-slate-300 bg-slate-50'} flex items-center justify-center overflow-hidden transition-all`}>
                                {thumbnail ? (
                                    <>
                                        <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                            <button 
                                                onClick={removeThumbnail}
                                                className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                                                title="Remove Image"
                                            >
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 p-6 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                                            <ImageIcon className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">No Image Selected</span>
                                        <p className="text-[10px] text-slate-400 mt-1">Recommended: 1280x720 px</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col pt-2">
                            <input 
                                type="file" 
                                id="course-thumbnail" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleThumbnailUpload}
                            />
                            <label 
                                htmlFor="course-thumbnail"
                                className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-all w-fit"
                            >
                                <Upload className="w-4 h-4 mr-2" /> 
                                {thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                            </label>
                            <p className="text-xs text-slate-500 mt-3 max-w-xs leading-relaxed">
                                Upload a high-quality image to attract students. Use a relevant image that represents your course topic clearly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Curriculum</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => openAIModal(null)} 
                        className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
                    >
                        <Sparkles className="w-4 h-4 mr-1.5" /> AI Plan Course
                    </button>
                    <button onClick={addModule} className="text-indigo-600 text-sm font-bold flex items-center hover:underline bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                        <Plus className="w-4 h-4 mr-1" /> Add Module
                    </button>
                </div>
                </div>
                
                {modules.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    No modules added yet. Use AI Plan Course or "Add Module" to get started.
                </div>
                )}

                {modules.map((mod, idx) => (
                <div 
                    key={mod.id} 
                    className={`relative p-5 rounded-xl border transition-all duration-300 ease-in-out
                        ${draggedModuleIndex === idx 
                            ? 'opacity-40 border-dashed border-slate-400 bg-slate-50 scale-95 ring-1 ring-slate-200' 
                            : 'bg-white border-slate-200 hover:shadow-md hover:border-indigo-200'
                        }
                        ${dragOverModuleIndex === idx && draggedModuleIndex !== idx 
                            ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/40 shadow-lg transform scale-[1.02] z-10' 
                            : ''
                        }
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 cursor-move">
                            <GripVertical className="text-slate-300 shrink-0" />
                            <span className="font-mono text-slate-400 font-bold text-sm shrink-0">{idx + 1}.</span>
                            <input 
                                value={mod.title}
                                onChange={e => updateModule(mod.id, 'title', e.target.value)}
                                className="flex-1 p-2 border-none focus:ring-0 font-medium text-slate-900 placeholder-slate-400 text-lg bg-transparent min-w-0"
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
                        <div className="relative">
                            <textarea 
                                value={mod.content}
                                onChange={e => updateModule(mod.id, 'content', e.target.value)}
                                className="w-full p-3 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[120px]"
                                placeholder="Enter module text content, lecture notes, or video script..."
                            />
                            {!mod.content && (
                                <button 
                                    onClick={() => openAIModal(mod.id)}
                                    className="absolute top-3 right-3 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded border border-indigo-100 hover:bg-indigo-100 flex items-center font-medium shadow-sm transition-colors"
                                    title="Automatically generate lesson content based on topic"
                                >
                                    <Sparkles className="w-3 h-3 mr-1.5" /> Auto-write Lesson
                                </button>
                            )}
                        </div>
                    )}
                    </div>
                </div>
                ))}
            </div>
        </>
      )}

      {/* Media Tab and Modals kept exactly as previous */}
      {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={() => setMediaMode('veo')} className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${mediaMode === 'veo' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white hover:border-indigo-300'}`}>
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Film className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-sm">Animate Image (Veo)</h4><p className="text-xs text-slate-500">Generate videos from text/image</p></div>
                  </button>
                  <button onClick={() => setMediaMode('edit')} className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${mediaMode === 'edit' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white hover:border-indigo-300'}`}>
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Wand2 className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-sm">Image Editor</h4><p className="text-xs text-slate-500">Edit with text instructions</p></div>
                  </button>
                  <button onClick={() => setMediaMode('video_analysis')} className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${mediaMode === 'video_analysis' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white hover:border-indigo-300'}`}>
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Scissors className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-sm">AI Video Analysis</h4><p className="text-xs text-slate-500">Get editing suggestions</p></div>
                  </button>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{mediaMode === 'veo' ? 'Generate Video with Veo' : mediaMode === 'edit' ? 'Edit Image with AI' : 'Analyze & Edit Video'}</h3>
                      {mediaMode !== 'video_analysis' ? (
                          <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{mediaMode === 'veo' ? 'Source Image (Optional for Veo)' : 'Source Image'}</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={(e) => setMediaImage(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {mediaImage ? <div className="flex items-center justify-center gap-2 text-green-600 font-medium truncate"><Check className="w-5 h-5 shrink-0" /> {mediaImage.name}</div> : <div className="text-slate-400 text-sm"><ImageIcon className="w-8 h-8 mx-auto mb-2" /><p>Click to upload image</p></div>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Prompt Instruction</label>
                                <textarea value={mediaPrompt} onChange={(e) => setMediaPrompt(e.target.value)} className="w-full p-3 border rounded-lg h-24 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500" placeholder={mediaMode === 'veo' ? "e.g. A neon hologram of a cat driving at top speed" : "e.g. Make it look like a pencil sketch..."} />
                            </div>
                            <button onClick={mediaMode === 'veo' ? handleVeoGenerate : handleImageEdit} disabled={mediaLoading || (mediaMode !== 'veo' && !mediaImage)} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2">
                                {mediaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} {mediaMode === 'veo' ? 'Generate Video' : 'Edit Image'}
                            </button>
                          </>
                      ) : (
                          <>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Source Video</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input type="file" accept="video/*" onChange={(e) => setAnalysisVideo(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {analysisVideo ? <div className="flex items-center justify-center gap-2 text-green-600 font-medium truncate"><Check className="w-5 h-5 shrink-0" /> {analysisVideo.name}</div> : <div className="text-slate-400 text-sm"><Video className="w-8 h-8 mx-auto mb-2" /><p>Click to upload video (Max 20MB)</p></div>}
                                </div>
                            </div>
                            <button onClick={handleVideoAnalysis} disabled={mediaLoading || !analysisVideo} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2">
                                {mediaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />} Analyze & Suggest Edits
                            </button>
                          </>
                      )}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center min-h-[300px] p-4 relative overflow-hidden">
                      {mediaLoading ? (
                          <div className="text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" /><p>Processing...</p></div>
                      ) : mediaResult ? (
                          mediaMode === 'veo' ? <video src={mediaResult} controls className="w-full h-full object-contain rounded-lg" /> :
                          mediaMode === 'edit' ? <img src={mediaResult} alt="Edited" className="w-full h-full object-contain rounded-lg" /> :
                          <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
                              <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm max-h-[50%] overflow-y-auto"><h4 className="font-bold text-slate-900 mb-1 sticky top-0 bg-white">Analysis</h4><p className="whitespace-pre-wrap text-slate-600">{mediaResult}</p></div>
                              {editSuggestions && <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-sm flex-1 overflow-y-auto custom-scrollbar"><h4 className="font-bold text-slate-200 mb-1 sticky top-0 bg-slate-800 flex items-center"><Scissors className="w-3 h-3 mr-2 text-amber-400" /> Suggestions</h4><div className="prose prose-invert prose-sm"><p className="whitespace-pre-wrap text-slate-300 font-mono text-xs">{editSuggestions}</p></div></div>}
                          </div>
                      ) : (
                          <div className="text-slate-400 text-sm text-center"><Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" /> AI Output will appear here</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                {activeModuleId === null ? <LayoutTemplate className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                <h3 className="text-lg font-bold">{activeModuleId === null ? 'AI Course Planner' : 'AI Content Assistant'}</h3>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {!generatedContent && generatedQuizData.length === 0 && generatedOutline.length === 0 ? (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">{activeModuleId === null ? 'Course Topic' : 'Lesson Topic'}</label><input value={aiConfig.topic} onChange={e => setAiConfig({...aiConfig, topic: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" /></div>
                  <button onClick={handleGenerateAI} disabled={isGenerating || !aiConfig.topic} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all">{isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 text-amber-400" /> {activeModuleId === null ? 'Generate Outline' : `Generate ${aiConfig.type === 'quiz' ? 'Quiz' : 'Lesson'}`}</>}</button>
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col">
                  {generatedOutline.length > 0 ? <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">{generatedOutline.map((mod, i) => <div key={i} className="bg-white p-3 rounded border border-slate-100"><p className="font-bold text-slate-800 text-sm mb-1">{i+1}. {mod.title}</p><p className="text-xs text-slate-500 line-clamp-2">{mod.description}</p></div>)}</div> : generatedQuizData.length > 0 ? <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">{generatedQuizData.map((q, i) => <div key={i} className="bg-white p-3 rounded border border-slate-100 text-sm"><p className="font-bold text-slate-800 mb-2">{i+1}. {q.question}</p></div>)}</div> : <textarea value={generatedContent} onChange={e => setGeneratedContent(e.target.value)} className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:ring-indigo-500 min-h-[200px]" />}
                </div>
              )}
            </div>
            {(generatedContent || generatedQuizData.length > 0 || generatedOutline.length > 0) && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsAIModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
                <button onClick={applyAIContent} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center"><Check className="w-4 h-4 mr-2" /> {generatedOutline.length > 0 ? 'Create Course Structure' : 'Insert Content'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
