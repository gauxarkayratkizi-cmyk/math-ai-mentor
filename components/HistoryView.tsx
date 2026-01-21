
import React from 'react';
import { ChatSession } from '../types';
import { MessageCircle, Calendar, ChevronRight, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  sessions: ChatSession[];
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectSession, onDeleteSession }) => {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Тарих бос</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-xs">Әлі ешқандай есеп шығарылмаған. Чатқа өтіп, алғашқы есебіңді жаз!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-slate-900 px-2">Алдыңғы есептер</h2>
      <div className="flex flex-col gap-3">
        {sessions.slice().sort((a, b) => b.timestamp - a.timestamp).map((session) => (
          <div 
            key={session.id}
            className="group relative bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm hover:border-indigo-200 transition-all cursor-pointer active:scale-[0.98]"
            onClick={() => onSelectSession(session)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold text-sm">{session.grade}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate pr-6">{session.title || 'Тақырыпсыз есеп'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.timestamp).toLocaleDateString('kk-KZ')}
                    </span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                      {session.topic}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
