// @ts-nocheck
import { useState, useRef } from 'react';
import { Layers, Sparkles, BookOpen, ChevronRight, BrainCircuit, UploadCloud, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useFlashcardGenerator } from '../hooks/useFlashcardGenerator';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/features/auth/hooks/useAuth';

export const FlashcardConfigPage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState([10]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium');
  const [selectedFiles, setSelectedFiles] = useState<{data: string, mimeType: string, name: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generateDeck, isGenerating } = useFlashcardGenerator();
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result && typeof event.target.result === 'string') {
                setSelectedFiles(prev => [...prev, {
                    data: event.target!.result as string,
                    mimeType: file.type,
                    name: file.name
                }]);
            }
        };
        reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!subject || !topic) {
      toast.error('Please enter both subject and topic.');
      return;
    }

    const fileDataForApi = selectedFiles.map(f => ({ data: f.data, mimeType: f.mimeType }));

    const deckId = await generateDeck({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      count: cardCount[0],
      fileData: fileDataForApi.length > 0 ? fileDataForApi : undefined
    });

    if (deckId) {
      navigate(`/student/exam-prep/flashcards/${deckId}`);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 w-full pt-8 pb-12"> 
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
            <Link to="/student/exam-prep" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-2 transition-colors">
               &larr; Back to Exam Hub
            </Link>

        <div className="text-center">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
              <Layers className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
             AI Flashcard Generator
           </h1>
           <p className="text-slate-600 dark:text-slate-400">
             Create smart flashcard decks powered by global knowledge pool.
           </p>
        </div>

<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-8">
           
           {/* Subject & Topic */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-primary" />
                 Topic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject (e.g. Biology)</label>
                    <Input 
                      placeholder="Enter subject..." 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specific Topic (e.g. Mitosis)</label>
                    <Input 
                      placeholder="Enter topic..." 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           {/* Difficulty */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5 text-primary" />
                 Difficulty Level
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {['easy', 'medium', 'hard'].map((level) => (
                    <button
                       key={level}
                       onClick={() => setDifficulty(level as any)}
                       className={`p-3 rounded-xl border-2 transition-all capitalize font-medium
                          ${difficulty === level 
                             ? 'border-primary bg-primary/5 text-primary' 
                             : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-primary/30'}`}
                    >
                       {level}
                    </button>
                 ))}
              </div>
           </div>

           {/* File Upload (Optional) */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <UploadCloud className="w-5 h-5 text-primary" />
                 Upload Source Material (Optional)
              </h2>
              <p className="text-sm text-slate-500">Upload a photo of your notes or a past paper to base your flashcards on.</p>
              
              <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center gap-4"
              >
                 <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <UploadCloud className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload images</p>
                    <p className="text-xs text-slate-500 mt-1">JPEG, PNG up to 5MB</p>
                 </div>
                 <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*, .pdf, .txt, .doc, .docx" 
                    multiple
                    onChange={handleFileChange}
                 />
              </div>

              {selectedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 text-center">
                              {file.mimeType.startsWith('image/') ? (
                                  <img src={file.data} alt="Upload" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="flex flex-col items-center">
                                      <FileText className="w-8 h-8 text-slate-400 mb-2" />
                                      <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{file.name || 'Document'}</span>
                                  </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                                      <X className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
           </div>

           {/* Count */}
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Number of Cards
                 </h2>
                 <span className="text-xl font-bold text-primary">{cardCount[0]}</span>
              </div>
              <Slider 
                value={cardCount} 
                onValueChange={setCardCount} 
                max={50} 
                min={5} 
                step={5} 
                className="py-4" 
              />
           </div>

           <Button 
               className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
               onClick={handleGenerate}
               disabled={isGenerating}
           >
              {isGenerating ? (
                 <>
                   <Sparkles className="w-5 h-5 animate-pulse" />
                   Generating Deck from Smart Pool...
                 </>
              ) : (
                 <>
                   Create Flashcards
                   <ChevronRight className="w-5 h-5" />
                 </>
              )}
           </Button>

           <div className="mt-6 text-center">
              {(!user?.plan || user.plan === 'free') ? (
                  <p className="text-sm text-slate-500">
                    <b>Free Plan Limit:</b> 3 Decks per day. <Link to="/student/settings" className="text-primary font-medium hover:underline">Upgrade to Pro</Link> for unlimited practice!
                  </p>
              ) : (
                  <p className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-2 px-4 rounded-lg inline-block">
                    ✨ Pro Plan: Unlimited Flashcards
                  </p>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};
