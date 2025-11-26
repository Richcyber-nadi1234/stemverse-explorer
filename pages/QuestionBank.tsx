
import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Tag, Trash2, Edit, Save, X, CheckCircle2, AlertCircle, CheckSquare, Square, FileUp, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Question, QuestionType } from '../types';

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'What is the value of Pi to two decimal places?',
    type: 'MCQ',
    subject: 'Mathematics',
    grade_level: 5,
    difficulty: 'Easy',
    marks: 2,
    options: ['3.12', '3.14', '3.16', '3.00'],
    correct_answer: '3.14',
    tags: ['geometry', 'numbers']
  },
  {
    id: 'q2',
    text: 'Explain the process of photosynthesis in plants.',
    type: 'ESSAY',
    subject: 'Science',
    grade_level: 6,
    difficulty: 'Hard',
    marks: 10,
    tags: ['biology', 'plants', 'life-cycle']
  },
  {
    id: 'q3',
    text: 'True or False: The Earth is flat.',
    type: 'TRUE_FALSE',
    subject: 'Science',
    grade_level: 4,
    difficulty: 'Easy',
    marks: 1,
    correct_answer: 'False',
    tags: ['astronomy', 'basics']
  },
  {
    id: 'q4',
    text: 'Write a Python function to calculate the factorial of a number.',
    type: 'CODE',
    subject: 'Computer Science',
    grade_level: 8,
    difficulty: 'Hard',
    marks: 15,
    tags: ['programming', 'python', 'algorithms']
  },
  {
    id: 'q5',
    text: 'What is the capital of Ghana?',
    type: 'MCQ',
    subject: 'History',
    grade_level: 5,
    difficulty: 'Easy',
    marks: 2,
    options: ['Lagos', 'Accra', 'Kumasi', 'Abuja'],
    correct_answer: 'Accra',
    tags: ['geography', 'west-africa']
  },
  {
    id: 'q6',
    text: 'Solve for x: 2x + 5 = 15',
    type: 'SHORT_ANSWER',
    subject: 'Mathematics',
    grade_level: 6,
    difficulty: 'Medium',
    marks: 5,
    correct_answer: '5',
    tags: ['algebra', 'equations']
  }
];

const initialFormState: Partial<Question> = {
  text: '',
  type: 'MCQ',
  subject: 'Mathematics',
  grade_level: 5,
  difficulty: 'Medium',
  marks: 5,
  options: ['', '', '', ''],
  correct_answer: '',
  tags: []
};

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter States
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>(initialFormState);
  const [tagInput, setTagInput] = useState('');

  const subjects = ['Mathematics', 'Science', 'Computer Science', 'English', 'History'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const grades = Array.from({ length: 12 }, (_, i) => i + 1); // Grades 1-12

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setTagInput('');
    setIsFormOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({ ...question });
    setTagInput(question.tags.join(', '));
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} questions?`)) {
      setQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSave = () => {
    if (!formData.text || !formData.subject) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t);
    
    const questionData: Question = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      text: formData.text!,
      type: formData.type as QuestionType,
      subject: formData.subject!,
      grade_level: formData.grade_level || 5,
      difficulty: (formData.difficulty as any) || 'Medium',
      marks: formData.marks || 5,
      options: formData.type === 'MCQ' ? formData.options : undefined,
      correct_answer: formData.correct_answer,
      tags: tags
    };

    if (editingId) {
      setQuestions(prev => prev.map(q => q.id === editingId ? questionData : q));
    } else {
      setQuestions(prev => [questionData, ...prev]);
    }
    
    setIsFormOpen(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const filteredQuestions = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 on filter change
    return questions.filter(q => {
      const matchesSubject = filterSubject === 'All' || q.subject === filterSubject;
      const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
      const matchesGrade = filterGrade === 'All' || q.grade_level === parseInt(filterGrade);
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSubject && matchesDifficulty && matchesGrade && matchesSearch;
    });
  }, [questions, filterSubject, filterDifficulty, filterGrade, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    const pageIds = paginatedQuestions.map(q => q.id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));

    const newSet = new Set(selectedIds);
    if (allSelected) {
      pageIds.forEach(id => newSet.delete(id));
    } else {
      pageIds.forEach(id => newSet.add(id));
    }
    setSelectedIds(newSet);
  };

  const isAllPageSelected = paginatedQuestions.length > 0 && paginatedQuestions.every(q => selectedIds.has(q.id));

  const addTagToSearch = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-500">Manage, categorize, and organize assessment questions.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => alert('Mock Import: Choose CSV file')}
                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
                <FileUp className="w-4 h-4 mr-2" />
                Import
            </button>
            <button 
                onClick={() => alert('Mock Export: Downloading questions.csv')}
                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
                <Download className="w-4 h-4 mr-2" />
                Export
            </button>
            <button 
                onClick={handleAddNew}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
            </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                <Filter className="w-4 h-4 mr-2" />
                <span className="font-medium">Filters:</span>
            </div>
            
            <select 
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Difficulty</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select 
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or tags..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400"
            />
          </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Stats & Selection Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
               {isAllPageSelected ? 
                 <CheckSquare className="w-5 h-5 text-indigo-600" /> : 
                 <Square className="w-5 h-5" />
               }
             </button>
             <span className="text-sm text-slate-600 font-medium">
                {selectedIds.size > 0 ? `${selectedIds.size} Selected` : `${filteredQuestions.length} Questions Found`}
             </span>
           </div>
           {selectedIds.size > 0 && (
             <button 
                onClick={handleBulkDelete}
                className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium flex items-center transition-colors"
             >
               <Trash2 className="w-4 h-4 mr-1.5" /> Delete Selected
             </button>
           )}
        </div>

        <div className="divide-y divide-slate-100">
          {paginatedQuestions.length === 0 ? (
             <div className="p-12 text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No questions found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your filters or add a new question.</p>
            </div>
          ) : (
            paginatedQuestions.map((q) => (
            <div key={q.id} className={`p-6 hover:bg-slate-50 transition-colors group ${selectedIds.has(q.id) ? 'bg-indigo-50/30' : ''}`}>
              <div className="flex justify-between items-start gap-4">
                <button onClick={() => toggleSelection(q.id)} className="mt-1 text-slate-400 hover:text-indigo-600">
                  {selectedIds.has(q.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                </button>
                
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                            ${q.type === 'MCQ' ? 'bg-blue-100 text-blue-700' : ''}
                            ${q.type === 'ESSAY' ? 'bg-purple-100 text-purple-700' : ''}
                            ${q.type === 'TRUE_FALSE' ? 'bg-orange-100 text-orange-700' : ''}
                            ${q.type === 'CODE' ? 'bg-slate-100 text-slate-700' : ''}
                            ${q.type === 'SHORT_ANSWER' ? 'bg-teal-100 text-teal-700' : ''}
                        `}>
                            {q.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {q.subject} • Grade {q.grade_level}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border
                            ${q.difficulty === 'Easy' ? 'border-green-200 text-green-600' : ''}
                            ${q.difficulty === 'Medium' ? 'border-yellow-200 text-yellow-600' : ''}
                            ${q.difficulty === 'Hard' ? 'border-red-200 text-red-600' : ''}
                        `}>
                            {q.difficulty}
                        </span>
                    </div>
                    
                    <h4 className="text-base font-medium text-slate-900 mb-2 line-clamp-2">{q.text}</h4>
                    
                    {q.type === 'MCQ' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-w-3xl">
                            {q.options.map((opt, i) => (
                                <div key={i} className={`text-sm px-3 py-2 rounded border flex items-center gap-2
                                    ${opt === q.correct_answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-100 text-slate-600'}
                                `}>
                                    {opt === q.correct_answer ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <span className="w-3.5 h-3.5 flex-shrink-0 rounded-full border border-slate-300"></span>}
                                    <span className="truncate">{opt}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        {q.tags.map(tag => (
                            <button 
                              key={tag} 
                              onClick={() => addTagToSearch(tag)}
                              className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                            >
                                <Tag className="w-3 h-3 mr-1 opacity-50" />
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="text-right mb-2">
                        <div className="text-sm font-bold text-slate-900">{q.marks} Marks</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleEdit(q)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
           <div className="text-xs text-slate-500">
             Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
           </div>
           <div className="flex gap-2">
             <button 
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="flex items-center px-3 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
             >
               <ChevronLeft className="w-3 h-3 mr-1" /> Previous
             </button>
             <button 
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages || totalPages === 0}
               className="flex items-center px-3 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
             >
               Next <ChevronRight className="w-3 h-3 ml-1" />
             </button>
           </div>
        </div>
      </div>

      {/* Edit/Create Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Question' : 'New Question'}</h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select 
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                className="w-full border-slate-300 rounded-lg text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            >
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                            <select 
                                value={formData.grade_level}
                                onChange={(e) => setFormData({...formData, grade_level: parseInt(e.target.value)})}
                                className="w-full border-slate-300 rounded-lg text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            >
                                {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select 
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as QuestionType})}
                                className="w-full border-slate-300 rounded-lg text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            >
                                <option value="MCQ">Multiple Choice</option>
                                <option value="TRUE_FALSE">True / False</option>
                                <option value="SHORT_ANSWER">Short Answer</option>
                                <option value="ESSAY">Essay</option>
                                <option value="CODE">Code Sandbox</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                            <select 
                                value={formData.difficulty}
                                onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                                className="w-full border-slate-300 rounded-lg text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                            <input 
                                type="number"
                                value={formData.marks}
                                onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                                className="w-full border-slate-300 rounded-lg text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                        <textarea 
                            value={formData.text}
                            onChange={(e) => setFormData({...formData, text: e.target.value})}
                            className="w-full border-slate-300 rounded-lg text-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500 h-32 bg-white text-slate-900" 
                            placeholder="Enter the question here..."
                        ></textarea>
                    </div>

                    {/* MCQ Options */}
                    {formData.type === 'MCQ' && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-slate-700">Options</label>
                            {formData.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-6 flex justify-center text-slate-400 text-sm">{String.fromCharCode(65+i)}</div>
                                    <input 
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                        className="flex-1 border-slate-300 rounded-lg text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                                        placeholder={`Option ${i+1}`}
                                    />
                                    <input 
                                        type="radio" 
                                        name="correct_answer"
                                        checked={formData.correct_answer === opt && opt !== ''}
                                        onChange={() => setFormData({...formData, correct_answer: opt})}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* True/False Options */}
                    {formData.type === 'TRUE_FALSE' && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-slate-700">Correct Answer</label>
                             <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                    <input 
                                        type="radio" 
                                        name="tf_answer"
                                        value="True"
                                        checked={formData.correct_answer === 'True'}
                                        onChange={() => setFormData({...formData, correct_answer: 'True'})}
                                        className="form-radio text-indigo-600" 
                                    />
                                    <span className="ml-2 text-sm">True</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input 
                                        type="radio" 
                                        name="tf_answer"
                                        value="False"
                                        checked={formData.correct_answer === 'False'}
                                        onChange={() => setFormData({...formData, correct_answer: 'False'})}
                                        className="form-radio text-indigo-600" 
                                    />
                                    <span className="ml-2 text-sm">False</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                        <input 
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="w-full border-slate-300 rounded-lg text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            placeholder="math, geometry, grade-5"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                    <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        {editingId ? 'Update Question' : 'Save to Bank'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};