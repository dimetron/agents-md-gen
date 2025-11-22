import React, { useState, useEffect } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';

const MobileWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Trigger on screens smaller than lg (1024px)
      if (window.innerWidth < 1024) {
        const hasSeenWarning = sessionStorage.getItem('mobile-warning-dismissed');
        if (!hasSeenWarning) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('mobile-warning-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <button 
          onClick={dismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
             <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 relative z-10">
                <Monitor className="w-8 h-8 text-blue-400" />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-xl border border-white/10 z-20">
                <Smartphone className="w-4 h-4 text-slate-500" />
             </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Desktop Recommended</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              UniGen is a pro-grade developer tool designed for large screens. 
              <br className="mb-2"/>
              Viewing generated code and managing complex configurations is best experienced on a desktop or laptop.
            </p>
          </div>

          <button 
            onClick={dismiss}
            className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;