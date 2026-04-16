import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const GlobalLoader = () => {
  const text = "MyTutorMe";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    // We add 1 to length so that the last character is also shown before clearInterval
    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-surface-light dark:bg-[#0f172a] fixed inset-0 z-[10000]">
      <div className="flex flex-col items-center justify-center gap-6">
        <motion.div
           initial={{ scale: 0.9, opacity: 0.8 }}
           animate={{ scale: 1.1, opacity: 1 }}
           transition={{ 
             duration: 1.2,
             repeat: Infinity,
             repeatType: "reverse",
             ease: "easeInOut"
           }}
           className="w-20 h-20 md:w-24 md:h-24 relative"
        >
          <img src="/icon.png" alt="MyTutorMe Logo" className="w-full h-full object-contain drop-shadow-xl" />
        </motion.div>
        
        <div className="flex items-center">
          <span className="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            {displayedText}
          </span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-1 md:w-1.5 h-8 md:h-10 bg-primary ml-1.5"
          />
        </div>
        
        <p className="text-slate-500 font-medium animate-pulse mt-2">
          Preparing your session...
        </p>
      </div>
    </div>
  );
};
