
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User as UserIcon, Maximize2, Minimize2, MessageCircle, Lightbulb, Mic, MicOff, Volume2, Loader2, Zap } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are Newton, the friendly and intelligent AI Tutor for the STEMverse platform. 
Your target audience is students aged 6-14, as well as teachers and parents.

Your Knowledge Base:
1. **STEM Topics**: You are an expert in Robotics (Arduino, Sensors), Coding (Python, Scratch, Web Dev), Science (Physics, Biology), and Mathematics. Explain concepts simply and use analogies suitable for kids.
2. **Platform Features**:
   - **Gamification**: Students earn **XP** (Experience Points) for lessons, level up, and maintain a **Streak** for daily activity.
   - **Badges**: Achievements like 'Code Ninja' or 'Robot Builder' unlocked by completing specific milestones.
   - **Marketplace**: A place where youth tutors can sell content and students can redeem virtual **Coins**.
   - **Live Classes**: Real-time video lessons with interactive whiteboards.
   - **Course Studio**: A tool for teachers to create AI-assisted curriculum.

Guidelines:
- Be encouraging, safe, and positive.
- If a user asks for code, provide simple, commented Python or Scratch-like explanations.
- If asked about the app, guide them to the Dashboard or Learning Hub.
- Keep responses concise unless asked for a detailed explanation.
`;

export const AITutor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'bot' | 'user' }[]>([
    { id: '1', text: "Hi! I'm Newton 🤖. Ask me about Robotics, Python, Math, or how to use this platform!", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Feature States
  const [useFastModel, setUseFastModel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  // --- UTILS ---
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix (e.g. "data:audio/wav;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read blob'));
        }
      };
      reader.readAsDataURL(blob);
    });
  };

  const decodeAudioData = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const channelCount = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length / channelCount;
    const buffer = ctx.createBuffer(channelCount, frameCount, sampleRate);
    
    for (let channel = 0; channel < channelCount; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * channelCount + channel] / 32768.0;
        }
    }
    return buffer;
  };

  // --- HANDLERS ---

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg = { id: Date.now().toString(), text: userText, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Model Selection: Flash Lite for speed, Pro for reasoning
      const modelName = useFastModel ? 'gemini-flash-lite-latest' : 'gemini-3-pro-preview';
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: userText }] },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      const responseText = response.text || "I couldn't generate a response.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot' }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error reaching the AI.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- SPEECH TO TEXT (Transcribe) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // or audio/wav
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTyping(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'audio/webm', // or match blob type
                data: base64Audio
              }
            },
            { text: "Transcribe this audio exactly as spoken." }
          ]
        }
      });
      
      if (response.text) {
        setInputValue(response.text.trim());
      }
    } catch (error) {
      console.error("Transcription Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // --- TEXT TO SPEECH (TTS) ---
  const speakLastMessage = async () => {
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
    if (!lastBotMessage) return;

    setIsSpeaking(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: lastBotMessage.text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(base64Audio, audioContext);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        
        source.onended = () => setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all z-50 animate-bounce-slow ring-4 ring-white/30 group"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white shadow-2xl border border-slate-200 z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMinimized ? 'w-auto h-auto rounded-full' : 'w-80 sm:w-96 h-[500px] rounded-2xl'}`}>
          
          {/* Header */}
          {isMinimized ? (
             <div 
               className="flex items-center gap-3 bg-indigo-600 text-white px-4 py-3 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
               onClick={() => setIsMinimized(false)}
             >
                <Bot className="w-5 h-5" />
                <span className="font-bold text-sm whitespace-nowrap">Chat with Newton</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="ml-2 p-1 hover:bg-white/20 rounded-full"
                >
                    <X className="w-3 h-3" />
                </button>
             </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between rounded-t-2xl cursor-pointer" onClick={() => setIsMinimized(true)}>
                <div className="flex items-center text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm border border-white/10 shadow-inner">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Newton AI</h3>
                    <span className="text-xs text-indigo-100 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-sm"></span> Online & Ready</span>
                </div>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                    className="hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                >
                    <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>
            </div>
          )}

          {/* Chat Body */}
          {!isMinimized && (
            <>
              {/* Toolbar */}
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setUseFastModel(!useFastModel)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${useFastModel ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'}`}
                      title={useFastModel ? "Using Flash Lite (Fast)" : "Using Pro (Smart)"}
                    >
                       <Zap className="w-3 h-3" /> {useFastModel ? 'Fast Mode' : 'Smart Mode'}
                    </button>
                 </div>
                 <button 
                   onClick={speakLastMessage}
                   disabled={isSpeaking}
                   className={`p-1.5 rounded-full ${isSpeaking ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'text-slate-400 hover:bg-slate-200'}`}
                   title="Read last response"
                 >
                    <Volume2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center shrink-0 mb-1 shadow-sm">
                            <Bot className="w-4 h-4 text-indigo-600" />
                        </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed relative group ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-1 border border-slate-300">
                            <UserIcon className="w-4 h-4 text-slate-500" />
                        </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-end gap-2 justify-start animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center shrink-0 mb-1 shadow-sm">
                        <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-4 shadow-sm flex gap-1 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question..."
                      className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-full pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                    {/* Mic Button */}
                    <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}`}
                      title="Hold to speak"
                    >
                       {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
                  >
                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
                <div className="mt-2 flex justify-center">
                    <span className="text-[10px] text-slate-400 flex items-center font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Powered by Gemini 3 Pro & Flash
                    </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
