
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { User, UserRole } from '../types';
import { Logo } from '../components/Logo';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Building2, GraduationCap, School, Phone, Upload, CheckCircle2 } from 'lucide-react';

type RegistrationType = 'student' | 'teacher' | 'school';

export const Register: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMode, setSuccessMode] = useState(false);
  
  const [regType, setRegType] = useState<RegistrationType>('student');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Student specific
    parentEmail: '',
    parentPhone: '',
    
    // Teacher/Tutor specific
    isTutor: false, // true = Tutor, false = Teacher
    subjects: '',
    qualificationFile: null as File | null,

    // School specific
    schoolName: '',
    registrationNumber: '',
    address: '',
    schoolDocFile: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'qualificationFile' | 'schoolDocFile') => {
    if (e.target.files && e.target.files[0]) {
        setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Role specific validation
    if (regType === 'student' && (!formData.parentEmail || !formData.parentPhone)) {
        setError("Parent contact details are required for students.");
        return;
    }
    if (regType === 'school' && !formData.schoolName) {
        setError("School Name is required.");
        return;
    }
    if (regType === 'school' && !formData.schoolDocFile) {
        setError("School Registration Document is required for verification.");
        return;
    }
    if (regType === 'teacher' && !formData.qualificationFile) {
        setError("Qualification document is required for verification.");
        return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let assignedRoles: UserRole[] = [];
      let isActive = false; // Default to inactive pending verification
      let displayName = formData.firstName;
      let uploadedDocs: string[] = [];

      if (regType === 'student') {
          assignedRoles = [UserRole.STUDENT];
          // Students might be auto-verified or require parent verification
      } else if (regType === 'teacher') {
          assignedRoles = formData.isTutor ? [UserRole.TUTOR] : [UserRole.TEACHER];
          if (formData.qualificationFile) uploadedDocs.push(formData.qualificationFile.name);
      } else if (regType === 'school') {
          assignedRoles = [UserRole.SCHOOL_ADMIN];
          displayName = formData.schoolName;
          if (formData.schoolDocFile) uploadedDocs.push(formData.schoolDocFile.name);
      }

      const newUser: User = {
        id: `u-${Date.now()}`,
        first_name: regType === 'school' ? formData.schoolName : formData.firstName,
        last_name: regType === 'school' ? 'Admin' : formData.lastName,
        email: formData.email,
        roles: assignedRoles,
        bio: regType === 'school' ? 'Educational Institution' : 'New member of STEMverse',
        interests: [],
        xp: 0,
        level: 1,
        coins: 100,
        streak: 0,
        active: isActive, // PENDING VERIFICATION
        verificationDocuments: uploadedDocs,
        verificationStatus: 'pending',
        avatarConfig: {
          seed: displayName,
          backgroundColor: 'b6e3f4',
          accessories: 'none'
        }
      };

      // We do NOT login immediately. We show the success screen.
      setIsLoading(false);
      setSuccessMode(true);
      
    }, 1500);
  };

  if (successMode) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
                <div className="text-slate-500 mb-6 space-y-2">
                    {regType === 'student' && (
                        <p>A verification link has been sent to your parent's email ({formData.parentEmail}).</p>
                    )}
                    {regType === 'teacher' && (
                        <p>We have sent a verification link to <strong>{formData.email}</strong>. Please verify your email to proceed. Your qualification documents will be reviewed shortly.</p>
                    )}
                    {regType === 'school' && (
                        <p>Your school registration documents have been submitted. Our administrative team will review your credentials and activate your account within 24 hours.</p>
                    )}
                </div>
                <button onClick={() => navigate('/login')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Return to Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10 relative flex flex-col max-h-[90vh]">
        <div className="p-8 pb-0">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 p-1.5 bg-white rounded-xl shadow-lg border border-slate-100">
              <Logo className="w-full h-full" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Join STEMverse</h2>

          {/* Role Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button 
                onClick={() => setRegType('student')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${regType === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <GraduationCap className="w-4 h-4" /> Student
              </button>
              <button 
                onClick={() => setRegType('teacher')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${regType === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <UserIcon className="w-4 h-4" /> Tutor
              </button>
              <button 
                onClick={() => setRegType('school')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${regType === 'school' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <School className="w-4 h-4" /> School
              </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}
        </div>

        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* COMMON FIELDS: EMAIL & PASSWORD */}
            {regType !== 'school' && (
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">First Name</label>
                    <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Last Name</label>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        required
                    />
                </div>
                </div>
            )}

            {regType === 'school' && (
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">School Name</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="schoolName"
                            value={formData.schoolName}
                            onChange={handleChange}
                            className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                            placeholder="e.g. Star Academy"
                            required
                        />
                    </div>
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">{regType === 'school' ? 'Admin Email' : 'Email Address'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* STUDENT SPECIFIC */}
            {regType === 'student' && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center"><UserIcon className="w-3 h-3 mr-1" /> Parent / Guardian Info</h4>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Parent Email</label>
                        <input
                            type="email"
                            name="parentEmail"
                            value={formData.parentEmail}
                            onChange={handleChange}
                            className="w-full p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                            placeholder="parent@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Parent Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                                type="tel"
                                name="parentPhone"
                                value={formData.parentPhone}
                                onChange={handleChange}
                                className="w-full pl-8 p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                                placeholder="+233 ..."
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TEACHER / TUTOR SPECIFIC */}
            {regType === 'teacher' && (
                <div className="space-y-3">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="isTutor" checked={!formData.isTutor} onChange={() => setFormData({...formData, isTutor: false})} className="text-indigo-600" />
                            <span className="text-sm text-slate-700">School Teacher</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="isTutor" checked={formData.isTutor} onChange={() => setFormData({...formData, isTutor: true})} className="text-indigo-600" />
                            <span className="text-sm text-slate-700">Private Tutor</span>
                        </label>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Subjects</label>
                        <input
                            name="subjects"
                            value={formData.subjects}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            placeholder="Math, Physics, Robotics..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Verification Doc</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50">
                            <input type="file" className="hidden" id="doc-upload" onChange={(e) => handleFileChange(e, 'qualificationFile')} />
                            <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-xs text-slate-500">{formData.qualificationFile ? formData.qualificationFile.name : "Upload ID or Certificate"}</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* SCHOOL SPECIFIC */}
            {regType === 'school' && (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Registration Number</label>
                        <input
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            placeholder="Gov. Reg No."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            placeholder="City, Region"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Registration Document</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50">
                            <input type="file" className="hidden" id="school-upload" onChange={(e) => handleFileChange(e, 'schoolDocFile')} />
                            <label htmlFor="school-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-xs text-slate-500">{formData.schoolDocFile ? formData.schoolDocFile.name : "Upload Official Reg. Doc"}</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    placeholder="••••••"
                    required
                    />
                </div>
                </div>
                <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Confirm</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    placeholder="••••••"
                    required
                    />
                </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center mt-4 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
