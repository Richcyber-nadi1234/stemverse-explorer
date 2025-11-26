
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { User, Trophy, Star, Zap, Smile, Camera, Save, RefreshCw, Lock, Upload, Image as ImageIcon, Plus, X, Check, AlertTriangle } from 'lucide-react';

const AVATAR_ACCESSORIES = [
  { id: 'none', name: 'None', icon: '🚫', minLevel: 0 },
  { id: 'glasses', name: 'Glasses', icon: '👓', minLevel: 1 },
  { id: 'prescription01', name: 'Reading', icon: '📖', minLevel: 2 },
  { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️', minLevel: 3 },
  { id: 'round', name: 'Round', icon: '🤓', minLevel: 4 },
  { id: 'kurt', name: 'Rocker', icon: '🎸', minLevel: 5 },
  { id: 'eyepatch', name: 'Pirate', icon: '🏴‍☠️', minLevel: 7 },
  { id: 'wayfarers', name: 'Cool', icon: '😎', minLevel: 10 },
];

const AVATAR_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffdfbf', 'fdcdc5', '90ee90', 'ffb6c1', 'f3e5f5', 'e0f7fa'
];

export const Profile: React.FC = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [bio, setBio] = useState(user?.bio || '');
  
  // Interests State
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [showAddInterest, setShowAddInterest] = useState(false);

  // Customization State
  const [activeTab, setActiveTab] = useState<'maker' | 'upload'>(user?.avatarConfig?.customAvatarUrl ? 'upload' : 'maker');
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarConfig?.seed || user?.first_name || 'seed');
  const [bgColor, setBgColor] = useState(user?.avatarConfig?.backgroundColor || 'b6e3f4');
  const [accessory, setAccessory] = useState(user?.avatarConfig?.accessories || 'none');
  
  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(user?.avatarConfig?.customAvatarUrl || null);

  if (!user) return null;

  const userLevel = user.level || 1;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUser({
      bio,
      interests,
      avatarConfig: {
        seed: avatarSeed,
        backgroundColor: bgColor,
        accessories: accessory,
        customAvatarUrl: activeTab === 'upload' && uploadedImage ? uploadedImage : undefined
      }
    });
    alert("Profile updated successfully!");
  };

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter(i => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
      setShowAddInterest(false);
    }
  };

  const diceBearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=${bgColor}&accessories=${accessory === 'none' ? '' : accessory}`;
  const displayAvatarUrl = activeTab === 'upload' && uploadedImage ? uploadedImage : diceBearUrl;

  const suggestedInterests = ['Robotics', 'Space', 'Coding', 'Biology', 'Math', 'Art', 'Physics', 'AI', 'Chemistry', 'Music'];
  const displayInterests = Array.from(new Set([...suggestedInterests, ...interests]));

  return (
    <div className="space-y-6">
      {!user.active && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start animate-in slide-in-from-top-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
              <div>
                  <h4 className="text-amber-800 font-bold text-sm">Account Pending Verification</h4>
                  <p className="text-amber-700 text-sm mt-1">
                      Your account is currently limited. Please check your email for verification links or wait for an administrator to approve your credentials.
                  </p>
              </div>
          </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500">Manage your identity and customize your STEMverse avatar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Stats */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
            <div className="relative group w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-100 mb-4 bg-slate-50">
              <img src={displayAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
            <p className="text-slate-500 capitalize mb-4">
                {user.roles.map(r => r.replace('_', ' ')).join(', ')}
            </p>
            
            {/* Gamification Stats */}
            <div className="w-full grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-4">
              <div>
                <div className="flex justify-center mb-1 text-amber-500"><Trophy className="w-5 h-5" /></div>
                <div className="font-bold text-slate-900">{userLevel}</div>
                <div className="text-xs text-slate-400">Level</div>
              </div>
              <div>
                <div className="flex justify-center mb-1 text-purple-500"><Zap className="w-5 h-5" /></div>
                <div className="font-bold text-slate-900">{user.xp || 0}</div>
                <div className="text-xs text-slate-400">XP</div>
              </div>
              <div>
                <div className="flex justify-center mb-1 text-blue-500"><Star className="w-5 h-5" /></div>
                <div className="font-bold text-slate-900">{user.badges?.length || 0}</div>
                <div className="text-xs text-slate-400">Badges</div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">About Me</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white text-slate-900 placeholder-slate-400"
              rows={4}
              placeholder="Tell us a bit about yourself..."
            />
          </div>
        </div>

        {/* Right Column: Customization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('maker')}
                    className={`flex items-center pb-2 border-b-2 transition-colors ${activeTab === 'maker' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                      <Smile className="w-5 h-5 mr-2" /> Avatar Studio
                  </button>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center pb-2 border-b-2 transition-colors ${activeTab === 'upload' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                      <ImageIcon className="w-5 h-5 mr-2" /> Upload Photo
                  </button>
              </div>
              
              {activeTab === 'maker' && (
                <button 
                    onClick={() => setAvatarSeed(Math.random().toString(36))}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Randomize
                </button>
              )}
            </div>

            {/* Customization Controls */}
            {activeTab === 'maker' ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                {/* Accessories */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Accessories</label>
                    <div className="flex flex-wrap gap-3">
                    {AVATAR_ACCESSORIES.map((item) => {
                        const isLocked = userLevel < item.minLevel;
                        return (
                        <button
                            key={item.id}
                            disabled={isLocked}
                            onClick={() => !isLocked && setAccessory(item.id)}
                            className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center w-24 h-24 transition-all ${
                            accessory === item.id 
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                : isLocked 
                                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                            }`}
                        >
                            {isLocked && (
                            <div className="absolute top-2 right-2 text-slate-400">
                                <Lock className="w-3 h-3" />
                            </div>
                            )}
                            <span className="text-2xl mb-1 opacity-90">{item.icon}</span>
                            <span className="text-xs font-medium">{item.name}</span>
                            {isLocked && (
                            <span className="absolute bottom-1 text-[9px] font-bold bg-slate-200 px-1.5 rounded text-slate-500">
                                Lvl {item.minLevel}
                            </span>
                            )}
                        </button>
                        );
                    })}
                    </div>
                </div>

                {/* Background Color */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Background Aura</label>
                    <div className="flex flex-wrap gap-4">
                    {AVATAR_COLORS.map((color) => (
                        <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${
                            bgColor === color ? 'border-indigo-600' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: `#${color}` }}
                        />
                    ))}
                    </div>
                </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                        {uploadedImage ? (
                            <div className="space-y-4">
                                <img src={uploadedImage} alt="Uploaded" className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-md" />
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium text-slate-900">Image selected</p>
                                    <label className="text-xs text-indigo-600 hover:underline cursor-pointer">
                                        Change Image
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Upload your photo</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">PNG, JPG or GIF. Max 5MB. Make sure your face is clearly visible.</p>
                                <label className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 cursor-pointer">
                                    Browse Files
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Interests / Tags */}
            <div className="pt-6 border-t border-slate-100 mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Interests</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {displayInterests.map((tag) => (
                    <button 
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                            interests.includes(tag)
                             ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                             : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                    >
                        {tag} {interests.includes(tag) && <Check className="w-3 h-3 inline-block ml-1" />}
                    </button>
                  ))}
                  
                  {showAddInterest ? (
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                            autoFocus
                            className="px-3 py-1.5 rounded-full text-sm border border-indigo-300 outline-none focus:ring-2 focus:ring-indigo-500 w-24 bg-white text-slate-900 placeholder-slate-400"
                            placeholder="Type..."
                        />
                        <button onClick={handleAddInterest} className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setShowAddInterest(false)} className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button 
                        onClick={() => setShowAddInterest(true)}
                        className="px-3 py-1.5 rounded-full text-sm border border-dashed border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 flex items-center"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </button>
                  )}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
