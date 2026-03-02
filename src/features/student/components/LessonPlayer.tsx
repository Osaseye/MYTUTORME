import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, PlayCircle, PauseCircle, ChevronLeft, ChevronRight, FileText, MessageSquare } from 'lucide-react';

interface LessonPlayerProps {
  lessonTitle: string;
  videoUrl?: string; // Placeholder for now
  onExit: () => void;
  onComplete: () => void;
}

export const LessonPlayer = ({ lessonTitle, onExit, onComplete }: LessonPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock video progress
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control the video element
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onExit}>
            <X className="w-6 h-6" />
          </Button>
          <div>
             <h2 className="font-bold text-lg leading-tight">{lessonTitle}</h2>
             <p className="text-xs text-slate-400">Module 2: Derivatives</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800" onClick={onComplete}>
                Mark as Complete
             </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
         {/* Video Area (Center) */}
         <div className="flex-1 bg-black flex flex-col relative group">
            {/* Mock Video Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"></div>
                
                <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl z-10"
                >
                    {isPlaying ? <PauseCircle className="w-10 h-10 text-white" /> : <PlayCircle className="w-10 h-10 text-white ml-1" />}
                </button>
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full bg-slate-700 h-1.5 rounded-full mb-4 cursor-pointer">
                    <div className="bg-primary h-full w-[35%] rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                    <span>08:45 / 22:15</span>
                    <div className="flex gap-4">
                        <button className="hover:text-primary">CC</button>
                        <button className="hover:text-primary">HD</button>
                        <button className="hover:text-primary">1x</button>
                    </div>
                </div>
            </div>
         </div>

         {/* Sidebar (Right) */}
         <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="flex border-b border-slate-800">
                <button className="flex-1 py-4 text-sm font-bold text-center border-b-2 border-primary text-white">Transcript</button>
                <button className="flex-1 py-4 text-sm font-bold text-center border-b-2 border-transparent text-slate-500 hover:text-slate-300">Notes</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                   <span className="text-primary font-bold">00:15</span> welcome back to the course. In this lesson, we're going to dive deep into the Power Rule.
                </p>
                <p className="text-sm text-white leading-relaxed">
                   <span className="text-primary font-bold">00:45</span> The Power Rule is one of the most fundamental tools you'll use in calculus. It states that for any real number n...
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                   <span className="text-primary font-bold">01:30</span> Let's look at an example. If we have f(x) = x^3, then f'(x) is simply 3x^2.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                   <span className="text-primary font-bold">02:10</span> But what happens if n is a fraction? Or a negative number? The rule still applies.
                </p>
                {/* ... more content */}
                
                <div className="my-8 h-px bg-slate-800"></div>
                
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> AI Tutor Insight
                </h4>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-300">
                    <p className="mb-2">"Recall that the Power Rule <span className="font-mono text-xs bg-slate-900 px-1 py-0.5 rounded">d/dx(x^n) = nx^(n-1)</span> works for all real numbers n ≠ 0."</p>
                    <Button size="sm" variant="secondary" className="w-full mt-2 h-8 text-xs">Ask for more examples</Button>
                </div>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                     <Button variant="ghost" size="sm" className="text-slate-400 gap-2">
                        <ChevronLeft className="w-4 h-4" /> Prev
                     </Button>
                     <Button size="sm" className="bg-primary text-white gap-2">
                        Next Lesson <ChevronRight className="w-4 h-4" />
                     </Button>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
};
