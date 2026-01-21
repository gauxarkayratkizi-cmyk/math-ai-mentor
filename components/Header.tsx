
import React from 'react';
import { Flame, Star, Compass } from 'lucide-react';
import { UserProgress } from '../types';

interface HeaderProps {
  progress: UserProgress;
}

const Header: React.FC<HeaderProps> = ({ progress }) => {
  const xpInCurrentLevel = progress.xp % 100;

  return (
    <header className="p-6 sticky top-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-white/40 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-2.5 rounded-[18px] text-white shadow-xl shadow-indigo-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Compass className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black premium-title tracking-tighter leading-none text-slate-900">
              MathAI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">Mentor</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1 opacity-70">Математика оңай</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden xs:flex items-center gap-2 bg-white/90 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm hover:scale-105 transition-transform">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-[12px] font-black text-slate-700">{progress.streak} КҮН</span>
          </div>
          
          <div className="flex items-center gap-3 bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg shadow-indigo-200 text-white hover:brightness-110 transition-all">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-80">LEVEL {progress.level}</span>
              <div className="w-14 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </div>
            <Star className="w-4.5 h-4.5 fill-current" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
