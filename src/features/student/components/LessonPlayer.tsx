import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface LessonPlayerProps {
  lessonTitle: string;
  contentUrl?: string; // Media URL for Video or PDF
  contentType?: string; // 'video' | 'pdf'
  onExit: () => void;
  onComplete: () => void;
}

export const LessonPlayer = ({ lessonTitle, contentUrl, contentType = 'video', onExit, onComplete }: LessonPlayerProps) => {

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
          </div>
        </div>
        {contentType === 'pdf' && (
           <div className="flex items-center gap-3">
               <Button variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800" onClick={onComplete}>
                  Mark Document as Read
               </Button>
           </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         {/* Content Area (Center) */}
         <div className="w-full lg:flex-1 bg-black flex flex-col relative group min-h-[40vh] lg:min-h-0">
            {contentUrl ? (
               <div className="absolute inset-0 flex items-center justify-center bg-black">
                   {contentType === 'pdf' ? (
                       <iframe 
                          src={`${contentUrl}#view=FitH`}
                          title={lessonTitle}
                          className="w-full h-full border-none bg-slate-900"
                       />
                   ) : (
                       <video 
                          src={contentUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                          onEnded={onComplete}
                          onError={(e) => console.error("Native Video Error:", e.target)}
                       />
                   )}
               </div>
            ) : (
               <div className="flex-1 flex items-center justify-center bg-slate-900 border border-slate-700 m-4 rounded-xl">
                   <p className="text-slate-500">No content available</p>
               </div>
            )}
         </div>

         {/* Sidebar (Right) */}
         <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col flex-1 lg:flex-none h-[50vh] lg:h-auto">
            <div className="flex border-b border-slate-800 flex-shrink-0">
                <button className="flex-1 py-3 md:py-4 text-sm font-bold text-center border-b-2 border-primary text-white">My Notes</button>
            </div>
            
            <div className="flex-1 p-4 flex flex-col bg-slate-900">
               <textarea 
                  className="flex-1 w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Type your notes here... They will be saved and can be used later to generate flashcards, mock exams, or ask the AI Tutor for help."
               ></textarea>
            </div>
         </div>
      </div>

    </div>
  );
};
