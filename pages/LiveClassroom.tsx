
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Hand, MessageSquare, Users, 
  Share, Monitor, PenTool, MoreVertical, Smile, LayoutGrid, Maximize, 
  Minimize, Eraser, Trash2, Send, Download, StopCircle, Settings, BarChart2, Heart, ThumbsUp, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

interface Participant {
  id: number;
  name: string;
  role: 'teacher' | 'student';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  active: boolean;
  totalVotes: number;
}

interface Reaction {
  id: number;
  emoji: string;
  left: number; // percentage
}

export const LiveClassroom: React.FC = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker' | 'whiteboard' | 'screenshare'>('gallery');
  const [sidebarView, setSidebarView] = useState<'chat' | 'participants' | 'polls' | null>('chat');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeReactions, setActiveReactions] = useState<Reaction[]>([]);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  // Jitsi meeting embed
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    const existing = document.getElementById('jitsi-api-script') as HTMLScriptElement | null;

    const loadJitsi = () => {
      if (jitsiContainerRef.current && !jitsiApiRef.current) {
        const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
        if (typeof JitsiMeetExternalAPI !== 'function') return;
        jitsiApiRef.current = new JitsiMeetExternalAPI('meet.jit.si', {
          roomName: 'STEMverseDemo',
          parentNode: jitsiContainerRef.current,
          userInfo: { displayName: 'You' },
          configOverwrite: {
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ['microphone','camera','desktop','raisehand','chat','tileview','hangup'],
          },
        });
      }
    };

    if (!existing) {
      const s = document.createElement('script');
      s.id = 'jitsi-api-script';
      s.src = 'https://meet.jit.si/external_api.js';
      s.async = true;
      s.onload = loadJitsi;
      document.body.appendChild(s);
    } else {
      existing.onload = loadJitsi;
      if ((window as any).JitsiMeetExternalAPI) loadJitsi();
    }

    return () => {
      try {
        jitsiApiRef.current?.dispose?.();
        jitsiApiRef.current = null;
      } catch {}
    };
  }, []);
  
  // Mock Data
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: 'Dr. K. Osei', role: 'teacher', isMuted: false, isVideoOff: false, isHandRaised: false, isSpeaking: true },
    { id: 2, name: 'You', role: 'student', isMuted: false, isVideoOff: false, isHandRaised: false, isSpeaking: false },
    { id: 3, name: 'Sarah Mensah', role: 'student', isMuted: true, isVideoOff: false, isHandRaised: true, isSpeaking: false },
    { id: 4, name: 'Kwame Jr.', role: 'student', isMuted: true, isVideoOff: true, isHandRaised: false, isSpeaking: false },
    { id: 5, name: 'John Doe', role: 'student', isMuted: true, isVideoOff: false, isHandRaised: false, isSpeaking: false },
    { id: 6, name: 'Ama O.', role: 'student', isMuted: true, isVideoOff: false, isHandRaised: false, isSpeaking: false },
    { id: 7, name: 'Kofi B.', role: 'student', isMuted: true, isVideoOff: true, isHandRaised: false, isSpeaking: false },
    { id: 8, name: 'Esi M.', role: 'student', isMuted: true, isVideoOff: false, isHandRaised: false, isSpeaking: false },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Sarah Mensah', time: '10:02 AM', text: 'Good morning everyone!' },
    { id: '2', sender: 'Dr. K. Osei', time: '10:03 AM', text: 'Welcome class. Today we are discussing Newton\'s Laws.' },
  ]);

  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 'p1',
      question: "What is Newton's Second Law?",
      options: [
        { id: 'o1', text: 'F = ma', votes: 15 },
        { id: 'o2', text: 'E = mc^2', votes: 2 },
        { id: 'o3', text: 'a^2 + b^2 = c^2', votes: 0 }
      ],
      active: true,
      totalVotes: 17
    }
  ]);

  // --- HANDLERS ---
  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
    setParticipants(prev => prev.map(p => p.id === 2 ? { ...p, isHandRaised: !isHandRaised } : p));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setParticipants(prev => prev.map(p => p.id === 2 ? { ...p, isMuted: !isMuted, isSpeaking: isMuted ? true : false } : p)); // Mock speaking when unmuted
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    setParticipants(prev => prev.map(p => p.id === 2 ? { ...p, isVideoOff: !isVideoOff } : p));
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      setViewMode('gallery');
    } else {
      setIsScreenSharing(true);
      setViewMode('screenshare');
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    
    setMessages([...messages, newMsg]);
    setChatInput('');
  };

  const triggerReaction = (emoji: string) => {
    const id = Date.now();
    const left = 10 + Math.random() * 80; // Random horizontal position 10-90%
    setActiveReactions(prev => [...prev, { id, emoji, left }]);
    setShowReactionsMenu(false);

    // Auto remove after animation
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  // --- COMPONENTS ---

  const AudioWaveform = () => (
    <div className="flex items-center gap-0.5 h-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="w-1 bg-green-400 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }}></div>
      ))}
    </div>
  );

  const VideoTile: React.FC<{ p: Participant; size?: 'normal' | 'large' }> = ({ p, size = 'normal' }) => (
    <div className={`relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center group transition-all duration-300
      ${size === 'large' ? 'w-full h-full' : 'aspect-video w-full'}
      ${p.isSpeaking && !p.isMuted ? 'ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : ''}
    `}>
      {!p.isVideoOff ? (
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} 
          alt={p.name} 
          className="w-full h-full object-cover opacity-90 bg-slate-700" 
        />
      ) : (
        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
           <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              {p.name.charAt(0)}
           </div>
        </div>
      )}
      
      {/* Status Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
        <div className="bg-black/60 px-2 py-1 rounded-lg text-white text-xs font-medium backdrop-blur-sm flex items-center gap-2 max-w-[80%]">
          {p.isMuted ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-green-400" />}
          <span className="truncate">{p.name} {p.id === 2 && '(You)'}</span>
        </div>
        {p.isSpeaking && !p.isMuted && (
           <div className="bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
              <AudioWaveform />
           </div>
        )}
      </div>

      {/* Hand Raise Badge */}
      {p.isHandRaised && (
        <div className="absolute top-3 left-3 bg-yellow-500 p-1.5 rounded-full animate-bounce shadow-lg z-10">
          <Hand className="w-4 h-4 text-black" />
        </div>
      )}

      {/* Hover Actions */}
      <div className="absolute top-3 right-3 hidden group-hover:flex gap-1 z-10">
        <button className="p-1.5 bg-slate-900/60 rounded-full text-white hover:bg-slate-900 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const Whiteboard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [lineWidth, setLineWidth] = useState(2);
    const socketRef = useRef<Socket | null>(null);
    const roomName = 'STEMverseDemo';

    useEffect(() => {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
      socketRef.current = io(`${API_URL}/live`, { transports: ['websocket'] });
      socketRef.current.emit('join', { room: roomName });

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Incoming events
      socketRef.current.on('draw', ({ stroke }) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !stroke?.points?.length) return;
        ctx.strokeStyle = stroke.color || '#000000';
        ctx.lineWidth = stroke.lineWidth || 2;
        ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
        const pts = stroke.points;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      });

      socketRef.current.on('clear', () => {
        const ctx = canvasRef.current?.getContext('2d');
        const c = canvasRef.current;
        if (ctx && c) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, c.width, c.height);
        }
      });

      return () => {
        try {
          socketRef.current?.emit('leave', { room: roomName });
          socketRef.current?.disconnect();
        } catch {}
      };
    }, []);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const [currentStroke, setCurrentStroke] = useState<{ points: {x:number;y:number}[]; color: string; tool: 'pen'|'eraser'; lineWidth: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const pos = getPos(e);
      const stroke = { points: [pos], color, tool, lineWidth };
      setCurrentStroke(stroke);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentStroke) return;
      const pos = getPos(e);
      currentStroke.points.push(pos);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      if (currentStroke && socketRef.current) {
        socketRef.current.emit('draw', { room: roomName, stroke: currentStroke });
      }
      setCurrentStroke(null);
    };

    const clearBoard = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
      }
      socketRef.current?.emit('clear', { room: roomName });
    };

    return (
      <div className="flex-1 bg-slate-100 p-2 sm:p-4 flex flex-col h-full rounded-2xl overflow-hidden relative">
         <div className="bg-white p-2 border-b flex justify-between items-center rounded-t-xl shadow-sm z-10">
            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setTool('pen')} 
                        className={`p-2 rounded transition-all ${tool === 'pen' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Pen"
                    >
                        <PenTool className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setTool('eraser')} 
                        className={`p-2 rounded transition-all ${tool === 'eraser' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Eraser"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                
                <div className="flex gap-1.5 items-center">
                    {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'].map(c => (
                        <button 
                            key={c} 
                            onClick={() => { setColor(c); setTool('pen'); }}
                            className={`w-6 h-6 rounded-full cursor-pointer shrink-0 border-2 transition-transform hover:scale-110 ${color === c && tool === 'pen' ? 'border-slate-900 scale-110' : 'border-transparent'}`} 
                            style={{backgroundColor: c}}
                        ></button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={lineWidth} 
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    title="Brush Size"
                />
            </div>
            <button 
                onClick={clearBoard} 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Board"
            >
                <Trash2 className="w-4 h-4" />
            </button>
         </div>
         <div className="flex-1 bg-white relative touch-none">
             <canvas 
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="absolute inset-0 w-full h-full cursor-crosshair"
             />
         </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-950 -m-4 md:-m-8 flex flex-col overflow-hidden text-slate-200">
        
        {/* --- FLOATING REACTIONS CONTAINER --- */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {activeReactions.map(r => (
                <div 
                    key={r.id}
                    className="absolute bottom-20 text-4xl animate-[floatUp_3s_ease-out_forwards] opacity-0"
                    style={{ left: `${r.left}%` }}
                >
                    {r.emoji}
                </div>
            ))}
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                    100% { transform: translateY(-400px) scale(1); opacity: 0; }
                }
            `}</style>
        </div>

        {/* --- TOP BAR --- */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-md relative z-20">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-red-400 tracking-wide whitespace-nowrap">REC</span>
                </div>
                <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
                <div className="min-w-0">
                    <h1 className="text-white font-bold text-sm truncate">Physics 101</h1>
                    <p className="text-[10px] text-slate-400 truncate">8 Attendees</p>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button onClick={() => setViewMode('gallery')} className={`p-2 rounded-md transition-colors ${viewMode === 'gallery' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Gallery View">
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('speaker')} className={`p-2 rounded-md transition-colors ${viewMode === 'speaker' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Speaker View">
                    <Maximize className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('whiteboard')} className={`p-2 rounded-md transition-colors ${viewMode === 'whiteboard' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Whiteboard">
                    <PenTool className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* --- MAIN STAGE --- */}
        <div className="flex-1 flex overflow-hidden relative bg-black">
            
            {/* Left Area: Content */}
            <div className="flex-1 relative overflow-hidden flex flex-col p-2 sm:p-4">
                {viewMode === 'whiteboard' ? (
                    <Whiteboard />
                ) : viewMode === 'screenshare' ? (
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-900/20 animate-pulse pointer-events-none"></div>
                            <div className="text-center p-4">
                                <Monitor className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-lg sm:text-xl font-bold text-white">You are sharing your screen</h3>
                                <button onClick={toggleScreenShare} className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 text-sm">
                                    Stop Sharing
                                </button>
                            </div>
                        </div>
                        <div className="h-24 sm:h-32 flex gap-2 sm:gap-4 overflow-x-auto pb-2 px-1">
                             {participants.filter(p => p.id !== 2).map(p => (
                                 <div key={p.id} className="w-32 sm:w-48 shrink-0">
                                     <VideoTile p={p} />
                                 </div>
                             ))}
                        </div>
                    </div>
                ) : viewMode === 'speaker' ? (
                    <div className="flex-1 flex flex-col gap-2 sm:gap-4">
                        <div className="flex-1">
                             <div ref={jitsiContainerRef} className="w-full h-full rounded-2xl border border-slate-700 overflow-hidden bg-black relative z-10" />
                        </div>
                        {/* Participant strip removed in favor of Jitsi tile view */}
                    </div>
                ) : (
                    // Gallery Grid
                    <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
                        <div className="w-full h-full">
                            <div ref={jitsiContainerRef} className="w-full h-full rounded-2xl border border-slate-700 overflow-hidden bg-black relative z-10" />
                        </div>
                    </div>
                )}
            </div>

            {/* --- RIGHT SIDEBAR --- */}
            <div className={`
                bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 shadow-2xl z-20 transition-all duration-300
                ${sidebarView ? 'absolute right-0 top-0 bottom-0 w-[85vw] sm:static sm:w-80' : 'w-0 sm:w-0'}
            `}>
                {/* Sidebar Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/95 backdrop-blur">
                    <button 
                        onClick={() => setSidebarView('chat')}
                        className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition-colors ${
                            sidebarView === 'chat' ? 'text-indigo-400 border-indigo-500 bg-slate-800' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" /> Chat
                    </button>
                    <button 
                        onClick={() => setSidebarView('participants')}
                        className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition-colors ${
                            sidebarView === 'participants' ? 'text-indigo-400 border-indigo-500 bg-slate-800' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <Users className="w-4 h-4" /> People
                    </button>
                    <button 
                        onClick={() => setSidebarView('polls')}
                        className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition-colors ${
                            sidebarView === 'polls' ? 'text-indigo-400 border-indigo-500 bg-slate-800' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <BarChart2 className="w-4 h-4" /> Polls
                    </button>
                    <button 
                        onClick={() => setSidebarView(null)}
                        className="w-12 border-b-2 border-transparent flex items-center justify-center text-slate-500 hover:text-white sm:hidden"
                    >
                        <Minimize className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {sidebarView === 'chat' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 space-y-4 min-h-0 pb-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-400">{msg.sender}</span>
                                            <span className="text-[10px] text-slate-600">{msg.time}</span>
                                        </div>
                                        <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm ${
                                            msg.isSelf 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sidebarView === 'participants' && (
                        <div className="space-y-2">
                            {participants.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300 text-xs font-bold border border-indigo-500/30">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">
                                                {p.name} {p.id === 2 && '(You)'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 capitalize">{p.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {p.isHandRaised && <Hand className="w-4 h-4 text-yellow-500 animate-bounce" />}
                                        {p.isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-green-400" />}
                                        {p.isVideoOff ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-green-400" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sidebarView === 'polls' && (
                        <div className="space-y-4">
                            {polls.map(poll => (
                                <div key={poll.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-white text-sm">{poll.question}</h4>
                                        {poll.active && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Active</span>}
                                    </div>
                                    <div className="space-y-2">
                                        {poll.options.map(opt => {
                                            const percentage = Math.round((opt.votes / poll.totalVotes) * 100) || 0;
                                            return (
                                                <div key={opt.id} className="relative">
                                                    <div className="flex justify-between text-xs text-slate-300 mb-1 z-10 relative">
                                                        <span>{opt.text}</span>
                                                        <span>{percentage}%</span>
                                                    </div>
                                                    <div className="h-8 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative cursor-pointer hover:border-indigo-500 transition-colors">
                                                        <div className="absolute left-0 top-0 bottom-0 bg-indigo-600/30 transition-all duration-500" style={{width: `${percentage}%`}}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-center text-[10px] text-slate-500 mt-3">{poll.totalVotes} votes total</p>
                                </div>
                            ))}
                            <button className="w-full py-2 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 text-xs font-bold hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                                + Create New Poll
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer (Chat Input) */}
                {sidebarView === 'chat' && (
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-slate-800 border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>

        {/* --- CONTROL BAR --- */}
        <div className="h-auto min-h-[80px] bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 py-3 sm:py-0 shrink-0 relative z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] flex-wrap sm:flex-nowrap gap-y-3">
            
            {/* Reactions Menu (Floating) */}
            {showReactionsMenu && (
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-700 p-2 rounded-2xl shadow-xl flex gap-2 animate-in slide-in-from-bottom-4 fade-in zoom-in-95 overflow-x-auto max-w-[90vw]">
                    {['👍', '❤️', '😂', '🎉', '👋', '🤔'].map(emoji => (
                        <button 
                            key={emoji} 
                            onClick={() => triggerReaction(emoji)}
                            className="text-2xl p-2 hover:bg-slate-700 rounded-xl transition-transform hover:scale-125 active:scale-90"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Media Controls */}
            <div className="flex items-center gap-2 sm:gap-4 justify-center flex-1 sm:flex-none order-1 sm:order-none">
                <button 
                    onClick={toggleMute}
                    className={`flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[60px] group ${isMuted ? 'text-red-500' : 'text-slate-300'}`}
                >
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-red-500/10 ring-1 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium opacity-70 group-hover:opacity-100 transition-opacity hidden sm:block">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button 
                    onClick={toggleVideo}
                    className={`flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[60px] group ${isVideoOff ? 'text-red-500' : 'text-slate-300'}`}
                >
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isVideoOff ? 'bg-red-500/10 ring-1 ring-red-500' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium opacity-70 group-hover:opacity-100 transition-opacity hidden sm:block">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
                </button>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 sm:gap-4 justify-center flex-1 sm:flex-none order-2 sm:order-none">
                <button 
                    onClick={toggleScreenShare}
                    className={`p-3 rounded-2xl transition-all ${isScreenSharing ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    title="Share Screen"
                >
                    {isScreenSharing ? <StopCircle className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </button>
                
                <button 
                    onClick={toggleHand}
                    className={`p-3 rounded-2xl transition-all ${isHandRaised ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    title="Raise Hand"
                >
                    <Hand className="w-5 h-5" />
                </button>

                <button 
                    onClick={() => setShowReactionsMenu(!showReactionsMenu)}
                    className={`p-3 rounded-2xl transition-all ${showReactionsMenu ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    title="Reactions"
                >
                    <Smile className="w-5 h-5" />
                </button>
            </div>

            {/* End Controls */}
            <div className="flex items-center gap-3 justify-end flex-1 sm:flex-none order-3 sm:order-none w-full sm:w-auto">
                <button onClick={() => setSidebarView(sidebarView ? null : 'chat')} className="text-slate-400 hover:text-white transition-colors sm:block p-2">
                    <Settings className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white px-6 flex items-center gap-2 shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all hover:-translate-y-0.5 flex-1 sm:flex-none justify-center"
                >
                    <PhoneOff className="w-5 h-5" />
                    <span className="font-bold text-sm">Leave</span>
                </button>
            </div>
        </div>
    </div>
  );
};
