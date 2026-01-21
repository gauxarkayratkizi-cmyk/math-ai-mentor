
import React, { useState } from 'react';
import { Lightbulb, Target, BrainCircuit, Trophy, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { Grade, GRADE_SUBJECTS, CONCEPT_DEFINITIONS } from '../types';
import MathTooltip from './MathTooltip';

interface SubjectSelectorProps {
  onSelect: (grade: Grade, topic: string) => void;
  currentGrade?: Grade;
  currentTopic?: string;
}

const MOTIVATIONS = [
  { 
    text: "Математика — бұл өте оңай әрі қызықты әлем! Бірге зерттеуге дайынсың ба? ✨", 
    label: "Логикалық талдау",
    icon: BrainCircuit, 
    color: "from-indigo-600 to-blue-700", 
    bg: "bg-indigo-50/50", 
    border: "border-indigo-100/80",
    accent: "text-indigo-600"
  },
  { 
    text: "Кез келген есептің шешімі бар. Тек оған басқа қырынан қарап көр! 🔍", 
    label: "Стратегиялық ойлау",
    icon: Target, 
    color: "from-emerald-500 to-teal-600", 
    bg: "bg-emerald-50/50", 
    border: "border-emerald-100/80",
    accent: "text-emerald-600"
  },
  { 
    text: "Сандармен ойнау — ең қызықты интеллектуалды жаттығу. Қане, бастайық! 🧩", 
    label: "Талдау және ізденіс",
    icon: Lightbulb, 
    color: "from-amber-500 to-orange-600", 
    bg: "bg-amber-50/50", 
    border: "border-amber-100/80",
    accent: "text-amber-600"
  }
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect, currentGrade: activeGrade, currentTopic: activeTopic }) => {
  const [selectedGrade, setSelectedGrade] = useState<Grade>(activeGrade || '5');
  const [motivation] = useState(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);

  const grades: Grade[] = ['5', '6', '7', '8', '9', '10', '11'];

  return (
    <div className="flex flex-col gap-6 mb-12 animate-in fade-in slide-in-from-top-6 duration-1000">
      {/* Motivation Header */}
      <div className={`relative overflow-hidden p-6 rounded-[32px] flex items-center gap-6 ${motivation.bg} border ${motivation.border} backdrop-blur-3xl shadow-sm group cursor-default`}>
        <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${motivation.color} shadow-lg text-white group-hover:scale-105 transition-transform duration-500`}>
          <motivation.icon className="w-6 h-6 stroke-[2.5px]" />
        </div>
        <div className="flex flex-col gap-1 z-10">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] premium-title ${motivation.accent} opacity-80`}>
            {motivation.label}
          </span>
          <p className="text-[15px] font-black text-slate-800 leading-tight">
            {motivation.text}
          </p>
        </div>
      </div>

      {/* Grade Selector Tabs - Scrollable */}
      <div className="bg-white/50 backdrop-blur-xl p-1.5 rounded-[24px] border border-slate-100 flex gap-2 shadow-sm overflow-x-auto no-scrollbar">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`flex-shrink-0 px-6 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${
              selectedGrade === grade 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
            }`}
          >
            {grade}-сынып
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GRADE_SUBJECTS[selectedGrade].map((topic) => {
          const isActive = activeTopic === topic;
          return (
            <MathTooltip 
              key={topic} 
              concept={topic} 
              definition={CONCEPT_DEFINITIONS[topic] || 'Бұл тақырып бойынша негізгі ережелер мен амалдарды үйренеміз.'}
            >
              <button
                onClick={() => onSelect(selectedGrade, topic)}
                className={`w-full group flex items-center justify-between p-4 rounded-[22px] border-2 transition-all text-left ${
                  isActive
                    ? 'bg-white border-indigo-600 shadow-md scale-[1.02]'
                    : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-[13px] font-bold truncate ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {topic}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-200 group-hover:text-indigo-300'}`} />
              </button>
            </MathTooltip>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSelector;
