
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Clock, FileText, MoreVertical, Filter, PlayCircle, CheckSquare, X, Save, AlertCircle, Users, MapPin, Trash2, ChevronRight, Search, ChevronDown, AlertTriangle } from 'lucide-react';
import { Exam, ExamSlot } from '../types';
import { useNavigate } from 'react-router-dom';

// Extended Exam Interface for local usage to include scheduling fields
interface ExtendedExam extends Exam {
    scheduled_date?: string;
    scheduled_time?: string;
}

const mockExams: ExtendedExam[] = [
  {
    id: '1',
    title: 'Mathematics Mid-Term',
    term_id: 'term-1',
    subject_id: 'Mathematics',
    class_id: 'Class 5A',
    total_marks: 100,
    pass_mark: 50,
    duration_mins: 90,
    status: 'published',
    created_at: '2023-10-01T10:00:00Z',
    difficulty: 'Medium',
    scheduled_date: '2023-10-15',
    scheduled_time: '09:00'
  },
  {
    id: '2',
    title: 'Science Final Assessment',
    term_id: 'term-1',
    subject_id: 'Integrated Science',
    class_id: 'Class 5A',
    total_marks: 100,
    pass_mark: 40,
    duration_mins: 120,
    status: 'scheduled',
    created_at: '2023-10-05T14:30:00Z',
    difficulty: 'Hard',
    scheduled_date: '2023-10-20',
    scheduled_time: '14:00'
  },
  {
    id: '3',
    title: 'History Pop Quiz',
    term_id: 'term-1',
    subject_id: 'History',
    class_id: 'Class 5B',
    total_marks: 20,
    pass_mark: 10,
    duration_mins: 15,
    status: 'draft',
    created_at: '2023-10-10T09:00:00Z',
    difficulty: 'Easy'
  },
  {
    id: '4',
    title: 'English Literature Review',
    term_id: 'term-1',
    subject_id: 'English Language',
    class_id: 'Class 6A',
    total_marks: 50,
    pass_mark: 25,
    duration_mins: 60,
    status: 'closed',
    created_at: '2023-09-20T09:00:00Z',
    difficulty: 'Medium',
    scheduled_date: '2023-09-25',
    scheduled_time: '10:00'
  }
];

const mockSlots: ExamSlot[] = [
    { id: 's1', exam_id: '1', date: '2023-10-15', start_time: '09:00', end_time: '10:30', room: 'Hall A', capacity: 50, invigilator_id: 't1', invigilator_name: 'John Doe' }
];

const mockTeachers = [
    { id: 't1', name: 'John Doe' },
    { id: 't2', name: 'Jane Smith' },
    { id: 't3', name: 'Dr. K. Osei' },
];

const StatusBadge = ({ status }: { status: Exam['status'] }) => {
  const colors = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-gray-100 text-gray-500 border-gray-200'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status]}`}>
      {status}
    </span>
  );
};

const DifficultyBadge = ({ difficulty }: { difficulty?: 'Easy' | 'Medium' | 'Hard' }) => {
    if (!difficulty) return null;
    const colors = {
        Easy: 'bg-green-50 text-green-700',
        Medium: 'bg-yellow-50 text-yellow-700',
        Hard: 'bg-red-50 text-red-700'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${colors[difficulty]}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${difficulty === 'Easy' ? 'bg-green-500' : difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            {difficulty}
        </span>
    );
};

export const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<ExtendedExam[]>(mockExams);
  const [allSlots, setAllSlots] = useState<ExamSlot[]>(mockSlots);
  const navigate = useNavigate();
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  // Exam Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  // Slot Management State
  const [activeExamForSlots, setActiveExamForSlots] = useState<Exam | null>(null);
  const [slotFormData, setSlotFormData] = useState({
      date: '',
      start_time: '',
      end_time: '',
      room: '',
      capacity: 30,
      invigilator_id: ''
  });
  const [slotConflict, setSlotConflict] = useState<string | null>(null);

  // Default Form State
  const initialFormState: Partial<ExtendedExam> = {
      title: '',
      subject_id: '',
      class_id: 'Class 5A',
      duration_mins: 60,
      total_marks: 100,
      pass_mark: 50,
      difficulty: 'Medium',
      status: 'draft',
      scheduled_date: '',
      scheduled_time: ''
  };
  const [formData, setFormData] = useState<Partial<ExtendedExam>>(initialFormState);

  // --- FILTER LOGIC ---
  const availableSubjects = useMemo(() => Array.from(new Set(exams.map(e => e.subject_id))), [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            exam.subject_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || exam.status === filterStatus.toLowerCase();
      const matchesDifficulty = filterDifficulty === 'All' || exam.difficulty === filterDifficulty;
      const matchesSubject = filterSubject === 'All' || exam.subject_id === filterSubject;

      return matchesSearch && matchesStatus && matchesDifficulty && matchesSubject;
    });
  }, [exams, searchQuery, filterStatus, filterDifficulty, filterSubject]);

  // --- EXAM CRUD ---
  const handleCreate = () => {
      setEditingId(null);
      setFormData(initialFormState);
      setIsModalOpen(true);
  };

  const handleEdit = (exam: ExtendedExam) => {
      setEditingId(exam.id);
      setFormData(exam);
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (!formData.title || !formData.subject_id) {
          alert("Please fill in all required fields");
          return;
      }

      if (editingId) {
          setExams(prev => prev.map(e => e.id === editingId ? { ...e, ...formData } as ExtendedExam : e));
      } else {
          const newExam: ExtendedExam = {
              id: Date.now().toString(),
              created_at: new Date().toISOString(),
              term_id: 'term-1', 
              ...formData as ExtendedExam
          };
          setExams(prev => [newExam, ...prev]);
      }
      setIsModalOpen(false);
  };

  const initiateDelete = (id: string) => {
      setExamToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (examToDelete) {
          setExams(prev => prev.filter(e => e.id !== examToDelete));
          setIsDeleteModalOpen(false);
          setExamToDelete(null);
      }
  };

  // --- SLOT MANAGEMENT ---
  const openSlotManager = (exam: Exam) => {
      setActiveExamForSlots(exam);
      setSlotFormData({
          date: new Date().toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:30',
          room: '',
          capacity: 30,
          invigilator_id: mockTeachers[0].id
      });
      setSlotConflict(null);
  };

  const handleAddSlot = () => {
      if (!activeExamForSlots || !slotFormData.room || !slotFormData.invigilator_id) return;

      // Conflict Detection
      const conflict = allSlots.find(s => {
          if (s.date !== slotFormData.date) return false;
          
          // Check time overlap
          const slotStart = s.start_time;
          const slotEnd = s.end_time;
          const newStart = slotFormData.start_time;
          const newEnd = slotFormData.end_time;

          const isOverlap = (newStart < slotEnd && newEnd > slotStart);
          
          if (isOverlap) {
              if (s.room.toLowerCase() === slotFormData.room.toLowerCase()) {
                  setSlotConflict(`Room Conflict: ${s.room} is already booked at this time.`);
                  return true;
              }
              if (s.invigilator_id === slotFormData.invigilator_id) {
                  const teacherName = mockTeachers.find(t => t.id === s.invigilator_id)?.name;
                  setSlotConflict(`Staff Conflict: ${teacherName} is already invigilating elsewhere.`);
                  return true;
              }
          }
          return false;
      });

      if (conflict) {
          // Error is set in the find callback if true
          return;
      }

      const newSlot: ExamSlot = {
          id: `slot-${Date.now()}`,
          exam_id: activeExamForSlots.id,
          date: slotFormData.date,
          start_time: slotFormData.start_time,
          end_time: slotFormData.end_time,
          room: slotFormData.room,
          capacity: slotFormData.capacity,
          invigilator_id: slotFormData.invigilator_id,
          invigilator_name: mockTeachers.find(t => t.id === slotFormData.invigilator_id)?.name
      };

      setAllSlots(prev => [...prev, newSlot]);
      setSlotConflict(null);
      // Reset room to allow quick add
      setSlotFormData(prev => ({...prev, room: ''}));
  };

  const handleDeleteSlot = (slotId: string) => {
      setAllSlots(prev => prev.filter(s => s.id !== slotId));
  };

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exam Management</h1>
          <p className="text-slate-500">Create, schedule, and grade student assessments.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Exam
        </button>
      </div>

      {/* Enhanced Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search exams by title or subject..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
            />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50"
            >
                <option value="All">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
            </select>

            <select 
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50"
            >
                <option value="All">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>

            <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50"
            >
                <option value="All">All Subjects</option>
                {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                ))}
            </select>
            
            {(searchQuery || filterStatus !== 'All' || filterDifficulty !== 'All' || filterSubject !== 'All') && (
                <button 
                    onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('All');
                        setFilterDifficulty('All');
                        setFilterSubject('All');
                    }}
                    className="ml-2 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                    Clear
                </button>
            )}
        </div>
      </div>

      {/* Exam List Cards */}
      <div className="grid gap-4">
        {filteredExams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">No exams found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
            </div>
        ) : (
            filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md group relative">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border shadow-sm ${
                        exam.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        exam.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                    <FileText className="w-6 h-6" />
                    </div>
                    <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                        <StatusBadge status={exam.status} />
                        <DifficultyBadge difficulty={exam.difficulty} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center text-slate-700 font-bold">
                            {exam.subject_id}
                        </span>
                        <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            <Users className="w-3 h-3 mr-1.5" /> {exam.class_id}
                        </span>
                        <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            {exam.duration_mins} mins
                        </span>
                        
                        {/* Scheduled Date Display */}
                        {exam.scheduled_date ? (
                            <span className="flex items-center text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                {new Date(exam.scheduled_date).toLocaleDateString()} 
                                {exam.scheduled_time && <span className="ml-1">at {exam.scheduled_time}</span>}
                            </span>
                        ) : (
                            <span className="flex items-center text-slate-400 italic">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                Unscheduled
                            </span>
                        )}
                    </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <button 
                    onClick={() => openSlotManager(exam)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Slots
                    </button>
                    <button 
                    onClick={() => navigate(`/exam/${exam.id}/take`)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Simulate Student View"
                    >
                    <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                    </button>
                    
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <div className="relative group/menu">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 hidden group-hover/menu:block hover:block z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button onClick={() => handleEdit(exam)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Edit Details</button>
                            <button onClick={() => navigate('/grading')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Grade Submissions</button>
                            <div className="h-px bg-slate-100"></div>
                            <button onClick={() => initiateDelete(exam.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
                </div>
                
                {/* Slots Preview */}
                {allSlots.some(s => s.exam_id === exam.id) && (
                    <div className="mt-4 pt-3 border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
                        {allSlots.filter(s => s.exam_id === exam.id).map(slot => (
                            <div key={slot.id} className="flex items-center text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 whitespace-nowrap">
                                <Calendar className="w-3 h-3 mr-1.5 text-indigo-500" /> 
                                <span className="font-medium text-slate-700">{slot.date}</span>
                                <span className="mx-1.5 text-slate-300">|</span>
                                <Clock className="w-3 h-3 mr-1.5 text-slate-400" /> {slot.start_time}
                                <span className="mx-1.5 text-slate-300">|</span>
                                <MapPin className="w-3 h-3 mr-1.5 text-slate-400" /> {slot.room}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            ))
        )}
      </div>

      {/* Exam Create/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Exam Setup' : 'Create New Exam'}</h3>
                          <p className="text-xs text-slate-500">Define assessment details and parameters.</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-5 overflow-y-auto">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Exam Title <span className="text-red-500">*</span></label>
                          <input 
                              value={formData.title}
                              onChange={e => setFormData({...formData, title: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-white text-slate-900"
                              placeholder="e.g. Mid-Term Physics Assessment"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                              <select 
                                  value={formData.subject_id}
                                  onChange={e => setFormData({...formData, subject_id: e.target.value})}
                                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                              >
                                  <option value="">Select Subject...</option>
                                  <option value="Mathematics">Mathematics</option>
                                  <option value="Integrated Science">Integrated Science</option>
                                  <option value="English Language">English Language</option>
                                  <option value="History">History</option>
                                  <option value="Computing">Computing / ICT</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Class</label>
                              <select 
                                  value={formData.class_id}
                                  onChange={e => setFormData({...formData, class_id: e.target.value})}
                                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                              >
                                  <option value="Class 5A">Class 5A</option>
                                  <option value="Class 5B">Class 5B</option>
                                  <option value="Class 6A">Class 6A</option>
                              </select>
                          </div>
                      </div>

                      {/* Scheduling Section */}
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">Scheduling Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-indigo-600 mb-1.5">Date</label>
                                  <input 
                                      type="date"
                                      value={formData.scheduled_date || ''}
                                      onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
                                      className="w-full border border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 text-sm"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-indigo-600 mb-1.5">Start Time</label>
                                  <input 
                                      type="time"
                                      value={formData.scheduled_time || ''}
                                      onChange={e => setFormData({...formData, scheduled_time: e.target.value})}
                                      className="w-full border border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 text-sm"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Parameters</h4>
                          
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Difficulty Level</label>
                                <select 
                                    value={formData.difficulty}
                                    onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1">Duration (min)</label>
                                  <input 
                                      type="number"
                                      value={formData.duration_mins}
                                      onChange={e => setFormData({...formData, duration_mins: parseInt(e.target.value)})}
                                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1">Total Marks</label>
                                  <input 
                                      type="number"
                                      value={formData.total_marks}
                                      onChange={e => setFormData({...formData, total_marks: parseInt(e.target.value)})}
                                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1">Pass Mark</label>
                                  <input 
                                      type="number"
                                      value={formData.pass_mark}
                                      onChange={e => setFormData({...formData, pass_mark: parseInt(e.target.value)})}
                                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="flex items-start p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                          <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                          <p>Teachers can add questions to this exam after the initial setup is saved.</p>
                      </div>

                      <div className="pt-2 flex gap-3 justify-end">
                          <button 
                              onClick={() => setIsModalOpen(false)}
                              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleSave}
                              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                          >
                              <Save className="w-4 h-4 mr-2" /> {editingId ? 'Save Changes' : 'Create Exam'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                      <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Exam?</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Are you sure you want to delete this exam? This action cannot be undone and will remove all associated questions and slots.
                  </p>
                  <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-5 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold shadow-lg shadow-red-200 transition-all transform active:scale-95 flex items-center"
                      >
                          <Trash2 className="w-4 h-4 mr-2" /> Yes, Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SLOT MANAGEMENT DRAWER */}
      {activeExamForSlots && (
          <div className="fixed inset-0 bg-slate-900/30 z-[60] backdrop-blur-sm flex justify-end">
              <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="font-bold text-lg text-slate-900">Manage Slots</h3>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{activeExamForSlots.title}</p>
                      </div>
                      <button onClick={() => setActiveExamForSlots(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      
                      {/* Add Slot Form */}
                      <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center">
                              <Plus className="w-4 h-4 mr-1.5 text-indigo-600" /> Add New Schedule
                          </h4>
                          
                          {slotConflict && (
                              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start animate-pulse">
                                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                  <span className="font-bold">{slotConflict}</span>
                              </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                                  <input 
                                      type="date" 
                                      value={slotFormData.date}
                                      onChange={e => setSlotFormData({...slotFormData, date: e.target.value})}
                                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Room</label>
                                  <input 
                                      type="text" 
                                      placeholder="e.g. Hall B"
                                      value={slotFormData.room}
                                      onChange={e => setSlotFormData({...slotFormData, room: e.target.value})}
                                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900"
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Start Time</label>
                                  <input 
                                      type="time" 
                                      value={slotFormData.start_time}
                                      onChange={e => setSlotFormData({...slotFormData, start_time: e.target.value})}
                                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">End Time</label>
                                  <input 
                                      type="time" 
                                      value={slotFormData.end_time}
                                      onChange={e => setSlotFormData({...slotFormData, end_time: e.target.value})}
                                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900"
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Invigilator</label>
                              <select 
                                  value={slotFormData.invigilator_id}
                                  onChange={e => setSlotFormData({...slotFormData, invigilator_id: e.target.value})}
                                  className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900"
                              >
                                  {mockTeachers.map(t => (
                                      <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                              </select>
                          </div>

                          <div className="pt-2">
                              <button 
                                  onClick={handleAddSlot}
                                  className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm transition-colors"
                              >
                                  Add Slot
                              </button>
                          </div>
                      </div>

                      {/* Existing Slots List */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Scheduled Slots</h4>
                          {allSlots.filter(s => s.exam_id === activeExamForSlots.id).length === 0 ? (
                              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                  No slots scheduled yet.
                              </div>
                          ) : (
                              allSlots.filter(s => s.exam_id === activeExamForSlots.id).map(slot => (
                                  <div key={slot.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group relative">
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <div className="flex items-center gap-2 mb-1">
                                                  <Calendar className="w-4 h-4 text-indigo-600" />
                                                  <span className="font-bold text-slate-800 text-sm">{new Date(slot.date).toLocaleDateString()}</span>
                                              </div>
                                              <div className="text-xs text-slate-500 space-y-1">
                                                  <p className="flex items-center"><Clock className="w-3 h-3 mr-1.5" /> {slot.start_time} - {slot.end_time}</p>
                                                  <p className="flex items-center"><MapPin className="w-3 h-3 mr-1.5" /> {slot.room} (Cap: {slot.capacity})</p>
                                                  <p className="flex items-center"><Users className="w-3 h-3 mr-1.5" /> {slot.invigilator_name}</p>
                                              </div>
                                          </div>
                                          <button 
                                              onClick={() => handleDeleteSlot(slot.id)}
                                              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
