import React, { useState, useEffect } from 'react';
import { Smartphone, X, Monitor } from 'lucide-react';

const MobileWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for mobile/tablet widths (md is 768px, lg is 1024px)
      // The app's complex dashboard layout is best viewed on larger screens
      if (window.innerWidth < 1024) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check on mount
    checkMobile();

    // Optional: Listen for resize if user rotates device
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[100] flex justify-center animate-fade-in-up pointer-events-none">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-yellow-500/30 rounded-2xl shadow-2xl p-4 flex items-start gap-4 max-w-md w-full pointer-events-auto ring-1 ring-black/50">
        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 shrink-0 animate-pulse">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
            Small Screen Detected
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            UniGen's generator and dashboards are optimized for Desktop. 
            Some advanced features might be hidden or require scrolling.
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <Monitor className="w-3 h-3" />
            <span>Recommend: Desktop / Laptop</span>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)} 
          className="p-2 -mr-2 -mt-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileWarning;