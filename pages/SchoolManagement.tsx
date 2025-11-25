
import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, MoreHorizontal, MapPin, X, FileUp, Download, Trash2, Edit, AlertCircle, Check, Calendar, Clock, BookOpen, Mail, AlertTriangle } from 'lucide-react';
import { Student, Teacher, ClassGroup, TimeTableEvent } from '../types';

// --- MOCK DATA ---
const initialStudents: Student[] = [
  { id: '1', user_id: 'u1', first_name: 'Kwame', last_name: 'Mensah', admission_no: 'ADM/23/001', class_id: 'Class 5A', active: true, grade_average: 85, attendance_rate: 98 },
  { id: '2', user_id: 'u2', first_name: 'Ama', last_name: 'Osei', admission_no: 'ADM/23/002', class_id: 'Class 5A', active: true, grade_average: 92, attendance_rate: 95 },
  { id: '3', user_id: 'u3', first_name: 'Kofi', last_name: 'Annan', admission_no: 'ADM/23/003', class_id: 'Class 5B', active: false, grade_average: 78, attendance_rate: 80 },
];

const initialTeachers: Teacher[] = [
    { id: 't1', user_id: 'tu1', first_name: 'John', last_name: 'Doe', subjects: ['Mathematics', 'Physics'], classes: ['Class 5A', 'Class 6B'] },
    { id: 't2', user_id: 'tu2', first_name: 'Jane', last_name: 'Smith', subjects: ['English', 'History'], classes: ['Class 5A', 'Class 5B'] },
];

const initialClasses: ClassGroup[] = [
    { id: 'c1', name: 'Class 5A', grade_level: 5, student_count: 32, teacher_id: 't1' },
    { id: 'c2', name: 'Class 5B', grade_level: 5, student_count: 30, teacher_id: 't2' },
    { id: 'c3', name: 'Class 6A', grade_level: 6, student_count: 28, teacher_id: 't1' },
];

const initialTimetable: TimeTableEvent[] = [
    { id: 'ev1', day: 'Monday', start_time: '08:00', end_time: '09:00', subject: 'Mathematics', class_id: 'Class 5A', room: 'Room 101' },
    { id: 'ev2', day: 'Monday', start_time: '09:00', end_time: '10:00', subject: 'English', class_id: 'Class 5A', room: 'Room 101' },
    { id: 'ev3', day: 'Monday', start_time: '10:30', end_time: '11:30', subject: 'Physics', class_id: 'Class 5A', room: 'Lab 2' },
    { id: 'ev4', day: 'Tuesday', start_time: '09:00', end_time: '10:00', subject: 'History', class_id: 'Class 5B', room: 'Room 104' },
];

// --- TOAST TYPE ---
interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export const SchoolManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'classes' | 'timetable'>('students');
  
  // --- GLOBAL STATE ---
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [classes, setClasses] = useState<ClassGroup[]>(initialClasses);
  const [timetable, setTimetable] = useState<TimeTableEvent[]>(initialTimetable);
  
  // Timetable State
  const [selectedTimetableClass, setSelectedTimetableClass] = useState<string>(initialClasses[0]?.name || 'Class 5A');

  // --- MODAL & EDIT STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, type: 'student' | 'teacher' | 'class' | 'event'} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Generic Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', id: '', email: '', // Common / Students / Teachers
    class_id: 'Class 5A', // Students
    subjects: '', // Teachers (comma separated)
    className: '', gradeLevel: 5, teacherId: '', // Classes
    day: 'Monday', startTime: '08:00', endTime: '09:00', subject: '', room: '' // Timetable
  });

  // --- TOAST STATE ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- IMPORT STATE ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // --- HELPERS ---
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // --- OPEN MODAL HANDLERS ---
  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', id: '', email: '',
      class_id: classes[0]?.name || 'Class 5A',
      subjects: '',
      className: '', gradeLevel: 5, teacherId: teachers[0]?.id || '',
      day: 'Monday', startTime: '08:00', endTime: '09:00', subject: '', room: ''
    });
    setEditingId(null);
  };

  const openAddModal = (day?: string, time?: string) => {
    resetForm();
    if (day && time) {
      setFormData(prev => ({ ...prev, day, startTime: time, endTime: time }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: any, type: 'student' | 'teacher' | 'class' | 'event') => {
    setEditingId(item.id);
    if (type === 'student') {
      setFormData({ ...formData, firstName: item.first_name, lastName: item.last_name, id: item.admission_no, class_id: item.class_id, email: `${item.first_name.toLowerCase()}@school.edu` });
    } else if (type === 'teacher') {
      setFormData({ ...formData, firstName: item.first_name, lastName: item.last_name, id: item.id, subjects: item.subjects.join(', '), email: `${item.first_name.toLowerCase()}.t@school.edu` });
    } else if (type === 'class') {
      setFormData({ ...formData, className: item.name, gradeLevel: item.grade_level, teacherId: item.teacher_id });
    } else if (type === 'event') {
      setFormData({ ...formData, day: item.day, startTime: item.start_time, endTime: item.end_time, subject: item.subject, room: item.room || '', class_id: item.class_id });
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string, type: 'student' | 'teacher' | 'class' | 'event') => {
      setDeleteTarget({ id, type });
      setIsDeleteModalOpen(true);
  };

  // --- CRUD HANDLERS ---

  // 1. STUDENTS
  const handleSaveStudent = () => {
    if (!formData.firstName || !formData.lastName || !formData.id) {
      showToast('error', 'Please fill in all required fields (Name, ID).');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
        showToast('error', 'Invalid email format.');
        return;
    }

    // Check ID Uniqueness
    const exists = students.find(s => s.admission_no === formData.id && s.id !== editingId);
    if (exists) {
      showToast('error', `Admission No "${formData.id}" already exists.`);
      return;
    }

    if (editingId) {
      setStudents(prev => prev.map(s => s.id === editingId ? { ...s, first_name: formData.firstName, last_name: formData.lastName, admission_no: formData.id, class_id: formData.class_id } : s));
      showToast('success', `Student "${formData.firstName} ${formData.lastName}" updated successfully.`);
    } else {
      setStudents(prev => [...prev, {
        id: Date.now().toString(), user_id: `u${Date.now()}`, first_name: formData.firstName, last_name: formData.lastName, admission_no: formData.id, class_id: formData.class_id, active: true, grade_average: 0, attendance_rate: 100
      }]);
      showToast('success', `Student "${formData.firstName} ${formData.lastName}" added to register.`);
    }
    setIsModalOpen(false);
  };

  // 2. TEACHERS
  const handleSaveTeacher = () => {
    if (!formData.firstName || !formData.lastName) {
      showToast('error', 'First and Last Name are required for staff.');
      return;
    }
    
    if (!formData.subjects) {
      showToast('error', 'Please assign at least one subject.');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
        showToast('error', 'Invalid email format.');
        return;
    }

    const duplicate = teachers.find(t => 
        t.id !== editingId && 
        t.first_name.toLowerCase() === formData.firstName.toLowerCase() && 
        t.last_name.toLowerCase() === formData.lastName.toLowerCase()
    );

    if (duplicate) {
        showToast('error', `A teacher named "${formData.firstName} ${formData.lastName}" already exists.`);
        return;
    }

    const subjectList = formData.subjects.split(',').map(s => s.trim()).filter(s => s);

    if (editingId) {
      setTeachers(prev => prev.map(t => t.id === editingId ? { ...t, first_name: formData.firstName, last_name: formData.lastName, subjects: subjectList } : t));
      showToast('success', `Staff record for "${formData.firstName} ${formData.lastName}" updated.`);
    } else {
      setTeachers(prev => [...prev, {
        id: `t${Date.now()}`, user_id: `tu${Date.now()}`, first_name: formData.firstName, last_name: formData.lastName, subjects: subjectList, classes: []
      }]);
      showToast('success', `Teacher "${formData.firstName} ${formData.lastName}" added successfully.`);
    }
    setIsModalOpen(false);
  };

  // 3. CLASSES
  const handleSaveClass = () => {
    if (!formData.className) {
      showToast('error', 'Class Name is required.');
      return;
    }

    if (formData.gradeLevel < 1 || formData.gradeLevel > 13) {
        showToast('error', 'Grade level must be between 1 and 13.');
        return;
    }

    const duplicate = classes.find(c => c.id !== editingId && c.name.toLowerCase() === formData.className.toLowerCase());
    if (duplicate) {
        showToast('error', `Class "${formData.className}" already exists.`);
        return;
    }

    if (editingId) {
      setClasses(prev => prev.map(c => c.id === editingId ? { ...c, name: formData.className, grade_level: formData.gradeLevel, teacher_id: formData.teacherId } : c));
      showToast('success', `Class "${formData.className}" details updated.`);
    } else {
      setClasses(prev => [...prev, {
        id: `c${Date.now()}`, name: formData.className, grade_level: formData.gradeLevel, teacher_id: formData.teacherId, student_count: 0
      }]);
      showToast('success', `New Class "${formData.className}" created successfully.`);
    }
    setIsModalOpen(false);
  };

  // 4. TIMETABLE
  const handleSaveEvent = () => {
    if (!formData.subject || !formData.startTime || !formData.endTime) {
      showToast('error', 'Subject, Start Time, and End Time are required.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
        showToast('error', 'End time must be after start time.');
        return;
    }

    // School Hours Validation (07:00 to 17:00)
    if (formData.startTime < '07:00' || formData.endTime > '17:00') {
        showToast('error', 'Events must be within school hours (07:00 - 17:00).');
        return;
    }

    // 1. Class Conflict Check
    const classConflict = timetable.find(e => 
      e.id !== editingId && 
      e.day === formData.day && 
      e.class_id === selectedTimetableClass && // Only check current class
      ((formData.startTime >= e.start_time && formData.startTime < e.end_time) ||
       (formData.endTime > e.start_time && formData.endTime <= e.end_time) || 
       (formData.startTime <= e.start_time && formData.endTime >= e.end_time))
    );

    if (classConflict) {
      showToast('error', `Class Conflict: "${classConflict.subject}" is already scheduled at this time.`);
      return;
    }

    // 2. Global Room Conflict Check
    if (formData.room) {
        const roomConflict = timetable.find(e => 
          e.id !== editingId &&
          e.day === formData.day &&
          e.room === formData.room &&
          ((formData.startTime >= e.start_time && formData.startTime < e.end_time) ||
           (formData.endTime > e.start_time && formData.endTime <= e.end_time) || 
           (formData.startTime <= e.start_time && formData.endTime >= e.end_time))
        );

        if (roomConflict) {
            showToast('error', `Room Conflict: ${formData.room} is occupied by ${roomConflict.class_id} at this time.`);
            return;
        }
    }

    if (editingId) {
      setTimetable(prev => prev.map(e => e.id === editingId ? {
        ...e, day: formData.day, start_time: formData.startTime, end_time: formData.endTime, subject: formData.subject, room: formData.room
      } : e));
      showToast('success', `Timetable updated for ${formData.day}.`);
    } else {
      setTimetable(prev => [...prev, {
        id: `ev${Date.now()}`, 
        day: formData.day, 
        start_time: formData.startTime, 
        end_time: formData.endTime, 
        subject: formData.subject, 
        class_id: selectedTimetableClass, // Assign to selected class
        room: formData.room
      }]);
      showToast('success', `Event "${formData.subject}" added to ${selectedTimetableClass} schedule.`);
    }
    setIsModalOpen(false);
  };

  // --- DELETE HANDLER (EXECUTED VIA MODAL) ---
  const performDelete = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;

    try {
        if (type === 'student') {
            setStudents(prev => prev.filter(s => s.id !== id));
            showToast('success', 'Student record permanently removed.');
        } else if (type === 'teacher') {
            setTeachers(prev => prev.filter(t => t.id !== id));
            showToast('success', 'Teacher removed from system.');
        } else if (type === 'class') {
            setClasses(prev => prev.filter(c => c.id !== id));
            showToast('success', 'Class and associated data deleted.');
        } else if (type === 'event') {
            setTimetable(prev => prev.filter(e => e.id !== id));
            showToast('success', 'Timetable event removed.');
        }
    } catch (e) {
        showToast('error', 'Failed to delete item. Please try again.');
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // --- ROUTER FOR SAVE ---
  const handleGlobalSave = () => {
    switch (activeTab) {
      case 'students': handleSaveStudent(); break;
      case 'teachers': handleSaveTeacher(); break;
      case 'classes': handleSaveClass(); break;
      case 'timetable': handleSaveEvent(); break;
    }
  };

  // --- CSV IMPORT (Simplified for UI demo) ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
        // Mock processing
        setTimeout(() => {
            showToast('success', `Successfully imported ${Math.floor(Math.random() * 10) + 5} records from CSV.`);
            setIsImportModalOpen(false);
        }, 1000);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* TOAST CONTAINER */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-2xl border-l-4 text-white transition-all duration-300 transform translate-x-0 ${
              toast.type === 'success' ? 'bg-slate-800 border-green-500' : 'bg-slate-800 border-red-500'
          } min-w-[300px]`}>
             <div className={`p-1.5 rounded-full mr-3 shrink-0 ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
             </div>
             <div className="flex-1">
                 <h4 className={`text-sm font-bold ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {toast.type === 'success' ? 'Success' : 'Action Failed'}
                 </h4>
                 <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
             </div>
             <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-3 text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4"/>
             </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Management</h1>
          <p className="text-slate-500">Manage students, staff, classes and schedules.</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'students' && (
             <button 
               onClick={() => setIsImportModalOpen(true)}
               className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
             >
               <FileUp className="w-4 h-4 mr-2" />
               Import CSV
             </button>
           )}
           {activeTab !== 'timetable' && (
             <button 
               onClick={() => openAddModal()}
               className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
             >
               <Plus className="w-4 h-4 mr-2" />
               {activeTab === 'students' ? 'Add Student' : activeTab === 'teachers' ? 'Add Staff' : 'Create Class'}
             </button>
           )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max">
          {(['students', 'teachers', 'classes', 'timetable'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* --- CONTENT AREAS --- */}

      {/* 1. STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder-slate-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                       <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                          {student.first_name[0]}{student.last_name[0]}
                       </div>
                       <div className="text-sm font-medium text-slate-900">{student.first_name} {student.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.admission_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{student.class_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(student, 'student')} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(student.id, 'student')} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TEACHERS TAB */}
      {activeTab === 'teachers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map(teacher => (
                  <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all group relative">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <button onClick={() => openEditModal(teacher, 'teacher')} className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-full"><Edit className="w-4 h-4" /></button>
                         <button onClick={() => confirmDelete(teacher.id, 'teacher')} className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                              {teacher.first_name[0]}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</h3>
                              <p className="text-sm text-slate-500">ID: {teacher.id.toUpperCase()}</p>
                          </div>
                      </div>
                      <div className="mt-6 space-y-2">
                          <div className="flex text-sm">
                              <span className="text-slate-500 w-20">Subjects:</span>
                              <span className="text-slate-900 font-medium">{teacher.subjects.join(', ')}</span>
                          </div>
                          <div className="flex text-sm">
                              <span className="text-slate-500 w-20">Classes:</span>
                              <span className="text-slate-900 font-medium">{teacher.classes.length > 0 ? teacher.classes.join(', ') : 'None assigned'}</span>
                          </div>
                      </div>
                  </div>
              ))}
              <button onClick={() => openAddModal()} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-slate-50 transition-all min-h-[200px]">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-medium">Add New Teacher</span>
              </button>
          </div>
      )}

      {/* 3. CLASSES TAB */}
      {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {classes.map(cls => {
                   const teacherName = teachers.find(t => t.id === cls.teacher_id)?.first_name || 'Unknown';
                   return (
                   <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:border-indigo-200 transition-colors group">
                       <div className="p-6 border-b border-slate-50 relative">
                           <div className="flex justify-between items-center mb-2">
                               <h3 className="text-xl font-bold text-slate-900">{cls.name}</h3>
                               <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">Grade {cls.grade_level}</span>
                           </div>
                           <p className="text-sm text-slate-500 flex items-center">
                               <Users className="w-4 h-4 mr-1" /> {cls.student_count} Students
                           </p>
                           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button onClick={() => openEditModal(cls, 'class')} className="p-1 text-indigo-600 bg-white shadow rounded-full"><Edit className="w-3 h-3" /></button>
                              <button onClick={() => confirmDelete(cls.id, 'class')} className="p-1 text-red-600 bg-white shadow rounded-full"><Trash2 className="w-3 h-3" /></button>
                           </div>
                       </div>
                       <div className="p-4 bg-slate-50 flex justify-between items-center">
                           <span className="text-sm text-slate-500">Tutor: <span className="font-medium text-slate-900">{teacherName}</span></span>
                           <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View Details</button>
                       </div>
                   </div>
               )})}
               <button onClick={() => openAddModal()} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-slate-50 transition-all min-h-[160px]">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-medium">Create New Class</span>
              </button>
          </div>
      )}

      {/* 4. TIMETABLE TAB */}
      {activeTab === 'timetable' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                     <h3 className="font-bold text-lg text-slate-900">Weekly Schedule</h3>
                     <select 
                        value={selectedTimetableClass} 
                        onChange={(e) => setSelectedTimetableClass(e.target.value)}
                        className="border-slate-200 rounded-lg text-sm p-2 border font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white"
                     >
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                     </select>
                  </div>
                  <div className="flex gap-2 items-center">
                     <span className="text-xs text-slate-400 flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></div>Click slot to add</span>
                  </div>
              </div>
              
              <div className="overflow-x-auto">
                  <div className="min-w-[800px] grid grid-cols-6 gap-2">
                      {/* Header Row */}
                      <div className="col-span-1"></div>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                          <div key={day} className="text-center font-bold text-slate-700 py-2 bg-slate-50 rounded-lg border border-slate-100">{day}</div>
                      ))}
                      
                      {/* Time Slots */}
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map(time => (
                          <React.Fragment key={time}>
                              <div className="text-xs text-slate-400 text-right pr-4 pt-4 -mt-2 border-t border-slate-100 font-mono">{time}</div>
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                                  // Filter events by selected Class ID AND Time
                                  const event = timetable.find(e => e.day === day && e.start_time.startsWith(time) && e.class_id === selectedTimetableClass);
                                  return (
                                      <div 
                                        key={`${day}-${time}`} 
                                        className="min-h-[100px] border border-slate-100 rounded-lg relative group hover:border-indigo-200 transition-colors bg-slate-50/30"
                                        onClick={() => !event && openAddModal(day, time)}
                                      >
                                          {event ? (
                                              <div 
                                                className="absolute inset-1 bg-indigo-50 border border-indigo-100 rounded-md p-2 cursor-pointer hover:bg-indigo-100 hover:shadow-sm transition-all"
                                                onClick={(e) => { e.stopPropagation(); openEditModal(event, 'event'); }}
                                              >
                                                  <p className="font-bold text-xs text-indigo-900 line-clamp-2">{event.subject}</p>
                                                  <p className="text-[10px] text-indigo-600 flex items-center mt-1">
                                                      <Clock className="w-3 h-3 mr-0.5" /> {event.start_time} - {event.end_time}
                                                  </p>
                                                  <p className="text-[10px] text-indigo-600 flex items-center mt-0.5">
                                                      <MapPin className="w-3 h-3 mr-0.5" /> {event.room}
                                                  </p>
                                                  <button 
                                                    onClick={(e) => { e.stopPropagation(); confirmDelete(event.id, 'event'); }}
                                                    className="absolute top-1 right-1 text-indigo-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  >
                                                      <X className="w-3 h-3" />
                                                  </button>
                                              </div>
                                          ) : (
                                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-indigo-400">
                                                  <Plus className="w-5 h-5" />
                                              </div>
                                          )}
                                      </div>
                                  );
                              })}
                          </React.Fragment>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- GLOBAL DYNAMIC MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold capitalize">
                {editingId ? 'Edit' : 'Add'} {activeTab === 'timetable' ? 'Event' : activeTab.slice(0, -1)}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="space-y-4">
              {/* FIELDS FOR STUDENTS AND TEACHERS */}
              {(activeTab === 'students' || activeTab === 'teachers') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input 
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input 
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" 
                        />
                    </div>
                  </div>
              )}

              {(activeTab === 'students' || activeTab === 'teachers') && (
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID / Admission No</label>
                    <input 
                      value={formData.id}
                      onChange={e => setFormData({...formData, id: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900" 
                      disabled={!!editingId}
                    />
                  </div>
              )}

              {(activeTab === 'students' || activeTab === 'teachers') && (
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg pl-10 p-2 bg-white text-slate-900" 
                        placeholder="user@school.edu"
                        />
                    </div>
                  </div>
              )}

              {activeTab === 'students' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                    <select 
                        value={formData.class_id}
                        onChange={e => setFormData({...formData, class_id: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                    >
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
              )}

              {activeTab === 'teachers' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subjects (comma separated)</label>
                    <input 
                        value={formData.subjects}
                        onChange={e => setFormData({...formData, subjects: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900" 
                        placeholder="Math, Physics"
                    />
                  </div>
              )}

              {/* FIELDS FOR CLASSES */}
              {activeTab === 'classes' && (
                  <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                        <input 
                            value={formData.className}
                            onChange={e => setFormData({...formData, className: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900" 
                            placeholder="Class 5A"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                            <input 
                                type="number"
                                value={formData.gradeLevel}
                                onChange={e => setFormData({...formData, gradeLevel: parseInt(e.target.value)})}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Form Tutor</label>
                            <select 
                                value={formData.teacherId}
                                onChange={e => setFormData({...formData, teacherId: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                            >
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                            </select>
                        </div>
                    </div>
                  </>
              )}

              {/* FIELDS FOR TIMETABLE */}
              {activeTab === 'timetable' && (
                  <>
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 mb-2">
                        Adding event to: <span className="font-bold">{selectedTimetableClass}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Event</label>
                        <input 
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                            <select 
                                value={formData.day}
                                onChange={e => setFormData({...formData, day: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                            <input 
                                value={formData.room}
                                onChange={e => setFormData({...formData, room: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900" 
                                placeholder="Room 101"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input 
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData({...formData, startTime: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input 
                                type="time"
                                value={formData.endTime}
                                onChange={e => setFormData({...formData, endTime: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                            />
                        </div>
                    </div>
                  </>
              )}

              <button onClick={handleGlobalSave} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mt-4 shadow-lg shadow-indigo-200">
                {editingId ? 'Save Changes' : 'Create Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h3>
                  <p className="text-slate-500 text-sm mb-6">
                      Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={performDelete}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium shadow-md transition-colors"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Import Modal (Simplified for UI demo) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <h3 className="text-lg font-bold mb-4">Import CSV</h3>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            <button onClick={() => setIsImportModalOpen(false)} className="mt-4 text-sm text-slate-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
