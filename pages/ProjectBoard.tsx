
import React, { useState, useMemo } from 'react';
import { Plus, MoreVertical, Calendar, CheckCircle2, Circle, Clock, AlertCircle, Search, Filter, X, Save, Trash2, User } from 'lucide-react';
import { ProjectTask } from '../types';

const mockStudents = [
  { id: 's1', name: 'Kwame Mensah' },
  { id: 's2', name: 'Ama Osei' },
  { id: 's3', name: 'Kofi Annan' },
  { id: 's4', name: 'Sarah Smith' },
];

const initialTasks: ProjectTask[] = [
  { id: 't1', title: 'Design Robot Chassis', student_id: 's1', student_name: 'Kwame Mensah', status: 'done', priority: 'high' },
  { id: 't2', title: 'Code Pathfinding Algorithm', student_id: 's2', student_name: 'Ama Osei', status: 'in_progress', priority: 'high' },
  { id: 't3', title: 'Assemble Sensors', student_id: 's3', student_name: 'Kofi Annan', status: 'todo', priority: 'medium' },
  { id: 't4', title: 'Write Project Report', student_id: 's1', student_name: 'Kwame Mensah', status: 'review', priority: 'low' },
];

export const ProjectBoard: React.FC = () => {
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectTask>>({
    title: '',
    student_id: '',
    priority: 'medium',
    status: 'todo'
  });

  const columns: { id: ProjectTask['status']; label: string; color: string; bg: string }[] = [
    { id: 'todo', label: 'To Do', color: 'border-slate-300', bg: 'bg-slate-50' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-400', bg: 'bg-blue-50/50' },
    { id: 'review', label: 'Needs Review', color: 'border-amber-400', bg: 'bg-amber-50/50' },
    { id: 'done', label: 'Completed', color: 'border-green-400', bg: 'bg-green-50/50' },
  ];

  // --- Actions ---

  const handleOpenModal = (task?: ProjectTask, defaultStatus: ProjectTask['status'] = 'todo') => {
    if (task) {
      setEditingTask(task);
      setFormData({ ...task });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        student_id: mockStudents[0].id,
        student_name: mockStudents[0].name,
        priority: 'medium',
        status: defaultStatus
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.student_id) return;

    const selectedStudent = mockStudents.find(s => s.id === formData.student_id);
    const taskToSave: ProjectTask = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: formData.title,
      student_id: formData.student_id,
      student_name: selectedStudent?.name || 'Unknown',
      priority: formData.priority as any,
      status: formData.status as any
    };

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskToSave : t));
    } else {
      setTasks(prev => [...prev, taskToSave]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingTask && window.confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== editingTask.id));
      setIsModalOpen(false);
    }
  };

  const moveTask = (taskId: string, newStatus: ProjectTask['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // --- Filtering ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.student_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Board</h1>
          <p className="text-slate-500 text-sm">Manage tasks for: <span className="font-semibold text-indigo-600">Mars Rover Prototype</span></p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-48"
              />
           </div>
           
           <select 
             value={filterPriority}
             onChange={(e) => setFilterPriority(e.target.value as any)}
             className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
           >
             <option value="all">All Priorities</option>
             <option value="high">High Priority</option>
             <option value="medium">Medium Priority</option>
             <option value="low">Low Priority</option>
           </select>

           <button 
             onClick={() => handleOpenModal()}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm transition-colors ml-auto sm:ml-0"
           >
             <Plus className="w-4 h-4 mr-2" />
             Add Task
           </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[1000px] h-full">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`flex-1 flex flex-col ${col.bg} rounded-xl border border-slate-200/60 shadow-inner`}>
                {/* Column Header */}
                <div className={`p-4 border-t-4 ${col.color} bg-white rounded-t-xl border-b border-slate-100 flex justify-between items-center shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{col.label}</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  {col.id === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />}
                </div>
                
                {/* Task List */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {colTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => handleOpenModal(task)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-slate-400 hover:text-indigo-600 p-1">
                             <MoreVertical className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-slate-900 mb-3 leading-tight">{task.title}</h4>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {task.student_name.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-500 truncate max-w-[80px]">{task.student_name.split(' ')[0]}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center bg-slate-50 px-1.5 py-0.5 rounded">
                           ID: {task.id}
                        </div>
                      </div>

                      {/* Quick Move Actions */}
                      <div className="mt-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-1 rounded-lg">
                         <button 
                           onClick={(e) => { e.stopPropagation(); moveTask(task.id, columns[Math.max(0, columns.findIndex(c => c.id === col.id) - 1)].id); }}
                           disabled={col.id === 'todo'}
                           className="text-xs font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-30 px-2 py-1"
                         >
                           ← Prev
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); moveTask(task.id, columns[Math.min(columns.length - 1, columns.findIndex(c => c.id === col.id) + 1)].id); }}
                           disabled={col.id === 'done'}
                           className="text-xs font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-30 px-2 py-1"
                         >
                           Next →
                         </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => handleOpenModal(undefined, col.id)}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all text-sm font-bold flex items-center justify-center gap-2 opacity-70 hover:opacity-100"
                  >
                    <Plus className="w-4 h-4" /> Add to {col.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Task Title</label>
                <input 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Build Robot Arm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign To</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={formData.student_id}
                    onChange={e => setFormData({...formData, student_id: e.target.value})}
                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {mockStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Needs Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
              {editingTask ? (
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              ) : <div></div>}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.title}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
