
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import SubjectSelector from './components/SubjectSelector';
import ImageEditor from './components/ImageEditor';
import HistoryView from './components/HistoryView';
import ProgressView from './components/ProgressView';
import { Message, UserProgress, ChatSession, Grade } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { Send, Image as ImageIcon, Camera, X, Loader2, MessageCircle, LayoutGrid, User as UserIcon, Paperclip, WifiOff } from 'lucide-react';

const STORAGE_KEY = 'mathai_mentor_v4';

type View = 'chat' | 'history' | 'progress';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentGrade, setCurrentGrade] = useState<Grade>('5');
  const [currentTopic, setCurrentTopic] = useState<string>('Жалпы математика');

  const [progress, setProgress] = useState<UserProgress>({
    solvedCount: 0,
    lastTopic: 'Жалпы математика',
    streak: 1,
    lastActive: new Date().toISOString(),
    errorsAnalyzed: [],
    xp: 0,
    level: 1,
    badges: [],
    sessions: []
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProgress(parsed);
      if (parsed.lastTopic) setCurrentTopic(parsed.lastTopic);
    }
    
    setMessages(prev => {
      if (prev.length === 0) {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: "Сәлем, жас математик! 👋\n\nМен — сенің сан әлеміндегі серігіңмін. Қандай есеп болса да әкел, біз оны жай ғана шешіп қоймай, қалай шыққанын бірге талдаймыз. 💡\n\nБүгін қандай тақырыпты бағындырамыз? Төмендегі мәзірден тақырыпты таңдап, маған сұрақ қой. 🔢📐",
          timestamp: Date.now()
        }];
      }
      return prev;
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (activeView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeView]);

  const handleTopicSelect = (grade: Grade, topic: string) => {
    setCurrentGrade(grade);
    setCurrentTopic(topic);
    
    const systemUpdate: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Өте жақсы таңдау! Енді біз ${grade}-сыныптың "${topic}" тақырыбы бойынша жұмыс істейміз. Қандай есебің бар? ✍️`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, systemUpdate]);
    
    setProgress(prev => ({ ...prev, lastTopic: topic }));
  };

  const handleSendMessage = async () => {
    if (!isOnline) return;
    if ((!inputText.trim() && !selectedImage && !selectedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText || (selectedFile ? `Файл: ${selectedFile.name}` : 'Бұл есепті түсіндіріп жіберші'),
      image: selectedImage || undefined,
      file: selectedFile || undefined,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    let attachment = undefined;
    if (selectedImage) {
      attachment = { data: selectedImage, mimeType: 'image/jpeg' };
    } else if (selectedFile) {
      attachment = { data: selectedFile.data, mimeType: selectedFile.mimeType };
    }

    setInputText('');
    setSelectedImage(null);
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const result = await sendMessageToGemini(newMessages, currentTopic, progress, attachment);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text || 'Кешіріңіз, түсінбедім... Қайта көрейікші! 🙏',
        sources: result.sources,
        timestamp: Date.now()
      };
      setMessages([...newMessages, aiMessage]);
      
      setProgress(prev => {
        const newXp = prev.xp + 25;
        return {
          ...prev,
          solvedCount: prev.solvedCount + 1,
          xp: newXp,
          level: Math.floor(newXp / 100) + 1,
          lastActive: new Date().toISOString(),
          sessions: [...prev.sessions, {
            id: userMessage.id,
            title: userMessage.content.substring(0, 30),
            topic: currentTopic,
            grade: currentGrade,
            messages: [...newMessages, aiMessage],
            timestamp: Date.now()
          }].slice(-20)
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedFile(null);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          data: reader.result as string,
          mimeType: file.type
        });
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header progress={progress} />

      {!isOnline && (
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-[12px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300 z-50 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          Интернет жоқ. Кейбір функциялар қолжетімсіз болуы мүмкін.
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 pb-48">
        {activeView === 'chat' && (
          <div className="flex flex-col gap-4">
            <SubjectSelector 
              onSelect={handleTopicSelect} 
              currentGrade={currentGrade} 
              currentTopic={currentTopic} 
            />
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-4 ml-2 mt-4">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-slate-800 tracking-tight">Есептеудемін...</span>
                  <span className="text-[10px] text-slate-400 premium-title">Логикалық талдау жүріп жатыр</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {activeView === 'history' && (
          <HistoryView 
            sessions={progress.sessions} 
            onSelectSession={(s) => { 
              setMessages(s.messages); 
              setCurrentGrade(s.grade);
              setCurrentTopic(s.topic);
              setActiveView('chat'); 
            }} 
            onDeleteSession={(id) => setProgress(p => ({ ...p, sessions: p.sessions.filter(s => s.id !== id) }))} 
          />
        )}
        
        {activeView === 'progress' && <ProgressView progress={progress} />}
      </main>

      {isEditing && selectedImage && (
        <ImageEditor imageSrc={selectedImage} onSave={(img) => { setSelectedImage(img); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />
      )}

      {activeView === 'chat' && (
        <div className="fixed bottom-28 left-0 right-0 px-6 z-40">
          <div className="max-w-4xl mx-auto glass-container rounded-[40px] p-3 flex flex-col gap-2">
            {(selectedImage || selectedFile) && (
              <div className="flex items-center gap-3 px-4 pt-2">
                {selectedImage ? (
                  <div className="relative w-16 h-16 group">
                    <img src={selectedImage} className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-white" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-3 bg-indigo-50/80 p-3 pr-10 rounded-2xl border border-indigo-100">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{selectedFile?.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            )}
            <div className={`flex items-center gap-2 bg-slate-50/80 rounded-[32px] p-1.5 border border-slate-100/50 group focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all ${!isOnline && 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center gap-1 px-2">
                <button onClick={() => cameraInputRef.current?.click()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"><Camera className="w-5.5 h-5.5" /></button>
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"><ImageIcon className="w-5.5 h-5.5" /></button>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <input type="file" ref={cameraInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" className="hidden" />
              <input type="file" ref={docInputRef} onChange={handleDocUpload} accept=".pdf,.doc,.docx,.txt" className="hidden" />
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isOnline ? "Есепті жаз немесе файл сал..." : "Желіге қосылыңыз..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-semibold py-4 resize-none max-h-32 min-h-[56px] placeholder:text-slate-400/80"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !isOnline || (!inputText.trim() && !selectedImage && !selectedFile)}
                className={`mr-1 p-4 rounded-full transition-all ${
                  isLoading || !isOnline || (!inputText.trim() && !selectedImage && !selectedFile) 
                    ? 'text-slate-300 bg-slate-100/50' 
                    : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200 active:scale-90'
                }`}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 px-8 py-8 z-50 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[35px] shadow-2xl shadow-indigo-200/50 px-10 py-4 flex justify-around items-center pointer-events-auto">
          <button onClick={() => setActiveView('chat')} className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'chat' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <MessageCircle className={`w-6 h-6 ${activeView === 'chat' && 'fill-current'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Чат</span>
          </button>
          <button onClick={() => setActiveView('history')} className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'history' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Тарих</span>
          </button>
          <button onClick={() => setActiveView('progress')} className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'progress' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Профиль</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
