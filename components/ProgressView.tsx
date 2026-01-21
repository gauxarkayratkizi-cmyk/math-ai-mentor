
import React from 'react';
import { UserProgress, BADGES } from '../types';
import { Trophy, Star, Target, Zap, Clock, Medal } from 'lucide-react';

interface ProgressViewProps {
  progress: UserProgress;
}

const ProgressView: React.FC<ProgressViewProps> = ({ progress }) => {
  const xpInCurrentLevel = progress.xp % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  const stats = [
    { label: 'Шешілген есеп', value: progress.solvedCount, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Ағымдағы деңгей', value: progress.level, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Жалпы XP', value: progress.xp, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Күнделікті сезім', value: `${progress.streak} күн`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Level Card */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Сенің деңгейің</span>
            <h2 className="text-3xl font-black">{progress.level} Деңгей</h2>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Прогресс</span>
            <span>{xpInCurrentLevel}/100 XP</span>
          </div>
          <div className="h-3 bg-indigo-900/30 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${xpInCurrentLevel}%` }}
            />
          </div>
          <p className="text-[10px] text-indigo-100 font-medium italic opacity-80 text-center">
            Келесі деңгейге жету үшін тағы {xpToNextLevel} XP қажет!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">{stat.label}</span>
            <span className="text-lg font-black text-slate-800">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Medal className="w-5 h-5 text-indigo-500" />
          Марапаттар
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = progress.badges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                  isUnlocked 
                    ? 'bg-white border-indigo-100 shadow-sm' 
                    : 'bg-slate-50 border-slate-100 grayscale opacity-60'
                }`}
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <h4 className="text-xs font-black text-slate-800 mb-1">{badge.name}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
