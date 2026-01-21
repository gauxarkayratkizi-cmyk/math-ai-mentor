
import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface MathTooltipProps {
  concept: string;
  definition: string;
  children: React.ReactNode;
}

const MathTooltip: React.FC<MathTooltipProps> = ({ concept, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block w-full">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-full"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <h5 className="text-[11px] font-black uppercase tracking-widest text-indigo-300">Анықтама</h5>
          </div>
          <p className="text-xs font-medium leading-relaxed opacity-90">
            {definition}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

export default MathTooltip;
