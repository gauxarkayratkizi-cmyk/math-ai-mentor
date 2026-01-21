
import React from 'react';
import { Message } from '../types';
import { User, Sparkles, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import katex from 'katex';

interface MessageBubbleProps { message: Message; }

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.role === 'assistant';

  const renderContentWithMath = (text: string) => {
    // $...$ және $$...$$ арасындағы формулаларды бөліп аламыз
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\n]+?\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        try {
          // Block math
          const formula = part.slice(2, -2);
          const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
          return <div key={index} className="my-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        try {
          // Inline math
          const formula = part.slice(1, -1);
          const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} mb-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      <div className={`flex items-start gap-4 max-w-[95%] md:max-w-[85%]`}>
        {isAI && (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-indigo-100 animate-float">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
        
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className={`px-5 py-4 rounded-[24px] ${
            isAI 
              ? 'bg-white/80 backdrop-blur-md text-slate-800 border border-white shadow-sm' 
              : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-100'
          }`}>
            {message.image && (
              <div className="mb-4 rounded-2xl overflow-hidden bg-slate-100/50 p-1 border border-white/20">
                <img src={message.image} alt="Task" className="max-w-full h-auto max-h-80 object-contain mx-auto rounded-xl" />
              </div>
            )}

            {message.file && !message.image && (
              <div className={`mb-3 flex items-center gap-3 p-3 rounded-xl ${isAI ? 'bg-slate-50' : 'bg-white/15'}`}>
                <div className={`p-2 rounded-lg ${isAI ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-400/30 text-white'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-bold truncate">{message.file.name}</span>
                  <span className={`text-[8px] font-bold uppercase ${isAI ? 'text-slate-400' : 'text-indigo-200'}`}>Құжат жүктелді</span>
                </div>
              </div>
            )}
            
            <div className="kz-text whitespace-pre-wrap text-[14.5px] leading-relaxed tracking-tight">
              {message.content.split('\n').map((line, i) => {
                const stepMatch = line.match(/^(\d+)-(қадам|қадам):/i) || line.match(/^(\d+)\./);
                if (stepMatch) {
                  return (
                    <div key={i} className={`mt-5 mb-3 flex items-start gap-3 p-3 rounded-2xl transition-all ${
                      isAI ? 'bg-indigo-50/50 border border-indigo-100/50' : 'bg-white/10'
                    }`}>
                      <div className={`flex items-center justify-center w-7 h-7 rounded-xl flex-shrink-0 text-[11px] font-black shadow-sm ${
                        isAI ? 'bg-white text-indigo-600' : 'bg-white text-indigo-600'
                      }`}>
                        {stepMatch[1]}
                      </div>
                      <span className={`pt-1 font-bold ${isAI ? 'text-slate-900' : 'text-white'}`}>
                        {renderContentWithMath(line.replace(stepMatch[0], '').trim())}
                      </span>
                    </div>
                  );
                }
                return <p key={i} className={`mb-2 last:mb-0 ${isAI ? 'font-medium' : 'font-medium'}`}>{renderContentWithMath(line)}</p>;
              })}
            </div>

            {isAI && message.sources && message.sources.length > 0 && (
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {message.sources.map((src, idx) => (
                  <a key={idx} href={src.uri} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/80 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-full text-[10px] font-bold transition-all border border-transparent hover:border-indigo-100">
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{src.title}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isAI && (
          <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 text-slate-400 shadow-md border border-slate-100">
            <User className="w-4.5 h-4.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
