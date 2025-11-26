
export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  TUTOR = 'tutor',
  SCHOOL_ADMIN = 'school_admin',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: UserRole[]; // Changed from single role to array
  school_id?: string;
  bio?: string;
  interests?: string[];
  avatarConfig?: AvatarConfig;
  streak?: number;
  xp?: number;
  level?: number;
  coins?: number; // Virtual currency
  badges?: string[];
  active: boolean; // New field for account status
  verificationDocuments?: string[]; // Names of uploaded files
  verificationStatus?: 'verified' | 'pending' | 'unverified' | 'rejected';
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

export interface AvatarConfig {
  seed: string;
  backgroundColor: string;
  accessories: string;
  customAvatarUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  term_id: string;
  subject_id: string;
  class_id: string;
  total_marks: number;
  pass_mark: number;
  duration_mins: number;
  status: 'draft' | 'scheduled' | 'published' | 'closed';
  created_at: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ExamSlot {
  id: string;
  exam_id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  capacity: number;
  invigilator_id: string;
  invigilator_name?: string;
}

export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  admission_no: string;
  class_id: string;
  active: boolean;
  grade_average?: number;
  attendance_rate?: number;
  projects_completed?: number;
  badges?: string[];
}

export interface Teacher {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  subjects: string[];
  classes: string[];
}

export interface ClassGroup {
  id: string;
  name: string;
  grade_level: number;
  student_count: number;
  teacher_id: string;
}

export interface TimeTableEvent {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  class_id: string;
  room?: string;
}

export interface Report {
  id: string;
  type: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  generated_at: string;
  file_url?: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'CODE';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  subject: string;
  grade_level: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  options?: string[]; // For MCQ
  correct_answer?: string;
  tags: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  exam_alerts: { email: boolean; sms: boolean; in_app: boolean };
  results_published: { email: boolean; sms: boolean; in_app: boolean };
  course_announcements: { email: boolean; sms: boolean; in_app: boolean };
  assignment_deadlines: { email: boolean; sms: boolean; in_app: boolean };
  marketing: { email: boolean; sms: boolean; in_app: boolean };
  system_updates: { email: boolean; sms: boolean; in_app: boolean };
}

// LMS Types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  progress: number; // 0-100
  total_lessons: number;
  completed_lessons: number;
  category: string;
  tags: string[];
  students_enrolled?: number;
  rating?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface AssignmentConfig {
  dueDate?: string;
  maxScore?: number;
  instructions?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_class';
  duration_mins: number;
  completed: boolean;
  content_url?: string;
  assignmentConfig?: AssignmentConfig; // For type='assignment'
  liveConfig?: {
      startTime: string;
      meetingId?: string;
      meetingLink?: string; // External URL for Zoom/Meet
      platform?: 'zoom' | 'meet' | 'internal';
  }
}

export interface LiveSession {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  start_time: string;
  duration_mins: number;
  status: 'scheduled' | 'live' | 'ended';
  attendees: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  creator_name: string;
  price: number; // In virtual coins or real currency
  rating: number;
  reviews: number;
  thumbnail: string;
  type: 'course' | 'worksheet' | 'tutor_session';
  description?: string;
  features?: string[];
}

export interface CartItem extends MarketplaceItem {
  quantity: number;
}

export interface Submission {
  id: string;
  student_name: string;
  exam_title: string; // Or Assignment Title
  submitted_at: string;
  status: 'graded' | 'pending';
  score?: number;
  total_marks: number;
  file_url?: string;
  feedback?: string;
}

// Project Management Types
export interface Project {
  id: string;
  title: string;
  description: string;
  due_date: string;
  assigned_to: string[]; // Student IDs
  status: 'planning' | 'active' | 'completed';
  tasks: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  title: string;
  student_id: string;
  student_name: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'locked';
    type: 'course' | 'project' | 'quiz';
    recommended_reason?: string; // AI Reason
}

export interface LeaderboardEntry {
    rank: number;
    student_name: string;
    xp: number;
    badges: number;
    avatar: string;
}

export interface SkillMetric {
    subject: string;
    proficiency: number; // 0-100
    status: 'Strong' | 'Improving' | 'Needs Focus';
}

export interface RecentScore {
    id: string;
    title: string;
    score: number;
    total: number;
    date: string;
}