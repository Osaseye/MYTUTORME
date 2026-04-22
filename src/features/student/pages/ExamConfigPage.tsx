import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Clock, 
  Settings,
  Layers,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Loader2,
  UploadCloud,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useExamGenerator } from '../hooks/useExamGenerator';

import { uploadFilesToStorage } from '@/utils/storageUploadService';

  const FilePreview = ({ file, onRemove }: { file: File, onRemove: () => void }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [file]);
  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 text-center">
        {file.type.startsWith('image/') && url ? (
            <img src={url} alt="Upload" className="w-full h-full object-cover" />
        ) : (
            <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{file.name || 'Document'}</span>
            </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
        </div>
    </div>
  );
};
export const ExamConfigPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { generateExam, isGenerating } = useExamGenerator();
    
    const [userDecks, setUserDecks] = useState<any[]>([]);
    const [userPlans, setUserPlans] = useState<any[]>([]);
    
    const [sourceType, setSourceType] = useState<'ai' | 'deck' | 'plan'>('ai');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
  
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!user) return;
    const fetchResources = async () => {
        try {
            // Fetch Decks
            const decksRef = collection(db, 'flashcard_decks');
            const dQ = query(decksRef, where('userId', '==', user.uid));
            const dSnap = await getDocs(dQ);
            const decks = dSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setUserDecks(decks);
            if (decks.length > 0) setSelectedDeck((decks[0] as any).title);
            
            // Fetch Plans
            const plansRef = collection(db, 'study_plans');
            const pQ = query(plansRef, where('userId', '==', user.uid));
            const pSnap = await getDocs(pQ);
            const plans = pSnap.docs.map(d => {
                const data = d.data();
                return { 
                    id: d.id, 
                    ...data,
                    title: data.title || `${data.subject || 'General'} Study Plan`
                };
            });
            setUserPlans(plans); 
            if (plans.length > 0) setSelectedPlan(plans[0].title);

        } catch (error) {
            console.error("Failed to load user resources", error);
        }
    };
    fetchResources();
  }, [user]);
  
  const [questionCount, setQuestionCount] = useState([10]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium');
  const [mode, setMode] = useState<'standard' | 'practice'>('standard');
  const [timeLimit, setTimeLimit] = useState<boolean>(true);

  const modes = [
    {
      id: 'standard',
      title: 'Standard Exam',
      desc: 'Normal timed exam format simulating real conditions.',
      icon: Clock
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      desc: 'See answers immediately after each question.',
      icon: BookOpen
    }
  ];

  const handleStartExam = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().activeExamId) {
            const activeExamId = userDoc.data().activeExamId;
            toast.error("You have an incomplete exam. Please finish it first!", {
                action: {
                    label: "Resume",
                    onClick: () => navigate(`/student/exam-prep/active/${activeExamId}`)
                }
            });
            return;
          }
        }
      } catch (err) {
        console.error("Error checking active exam status", err);
      }

      let finalSub = selectedSubject;
    let finalTop = selectedTopic;
    if (sourceType === 'deck') {
        if (!selectedDeck) { toast.error('Please select a deck.'); return; }
        finalSub = 'Flashcard Deck';
        finalTop = selectedDeck;
    } else if (sourceType === 'plan') {
        if (!selectedPlan) { toast.error('Please select a study plan.'); return; }
        finalSub = 'Study Plan';
        finalTop = selectedPlan;
    } else {
        if (!selectedSubject || !selectedTopic) {
            toast.error('Please select both a subject and a topic.');
            return;
        }
    }
    
    // The hook creates the pool and quiz document
    const loadingToastId = toast.loading('Generating your custom exam... Please wait.');
    try {
          let fileDataForApi: any[] | undefined = undefined;
          
          if (selectedFiles.length > 0 && user) {
            try {
              const storagePaths = await uploadFilesToStorage(selectedFiles, user.uid, 'exam-uploads');
              fileDataForApi = selectedFiles.map((file, index) => ({
                storagePath: storagePaths[index],
                mimeType: file.type || 'application/octet-stream'
              }));
            } catch (error: any) {
              toast.error('File upload failed: ' + error.message, { id: loadingToastId });
              return;
            }
          }
  
          const quizId = await generateExam({
            subject: finalSub,
            topic: finalTop,
            difficulty,
            count: questionCount[0],
            mode,
            fileData: fileDataForApi
          });
  
          if (quizId) {
            toast.success('Exam generated successfully!', { id: loadingToastId });
            navigate(`/student/exam-prep/active/${quizId}`);
        } else {
            toast.error('Could not generate exam. Please try a different topic.', { id: loadingToastId });
        }
    } catch (err) {
        toast.error('An error occurred during generation.', { id: loadingToastId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-12 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/student/exam-prep" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
               &larr; Back to Exam Hub
            </Link>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Configure Mock Exam</h1>
                <p className="text-slate-600 dark:text-slate-400">Customize your practice session to target specific goals.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Source Selection */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" /> Exam Source
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                            {[
                                { id: 'ai', label: 'AI Topic Generator' },
                                { id: 'deck', label: 'Flashcard Deck' },
                                { id: 'plan', label: 'Study Plan' }
                            ].map((src) => (
                                <button
                                    key={src.id}
                                    onClick={() => setSourceType(src.id as any)}
                                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                        sourceType === src.id
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                    }`}
                                >
                                    {src.label}
                                </button>
                            ))}
                        </div>

                        {sourceType === 'ai' && (
                            <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={selectedSubject}
                                        onChange={(e) => {
                                            setSelectedSubject(e.target.value);
                                            setSelectedTopic('');
                                        }}
                                        placeholder="Enter subject (e.g. Mathematics)"
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                                    />
                                </div>
                                {selectedSubject && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Topic</label>
                                        <input
                                            type="text"
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            placeholder="Enter specific topic (e.g. Limits in Calculus)"
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {sourceType === 'deck' && (
                            <div className="animate-in fade-in slide-in-from-top-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Flashcard Deck</label>
                                <select 
                                    value={selectedDeck}
                                    onChange={(e) => setSelectedDeck(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                                >
                                    {userDecks && userDecks.length > 0 ? (
                                        userDecks.map(deck => <option key={deck.id} value={deck.title}>{deck.title}</option>)
                                    ) : (
                                        <option value="" disabled>No flashcard decks found</option>
                                    )}
                                </select>
                            </div>
                        )}

                        {sourceType === 'plan' && (
                            <div className="animate-in fade-in slide-in-from-top-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Study Plan</label>
                                <select 
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                                >
                                    {userPlans && userPlans.length > 0 ? (
                                        userPlans.map(plan => <option key={plan.id} value={plan.title}>{plan.title}</option>)
                                    ) : (
                                        <option value="" disabled>No study plans found</option>
                                    )}
                                </select>
                            </div>
                        )}
                        
                        {sourceType === 'ai' && (
                            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-primary" />
                                        Upload Study Material (Optional)
                                    </div>
                                </h2>
                                <p className="text-xs text-slate-500 mb-4">Upload past question papers or notes to base your exam on.</p>
                                
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center gap-2"
                                >
                                    <UploadCloud className="w-6 h-6 text-slate-400" />
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload images/documents</p>
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
                                        {selectedFiles.map((file, idx) => (<FilePreview key={idx} file={file} onRemove={() => removeFile(idx)} />))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Exam Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" /> Exam Settings
                        </h2>

                        <div className="space-y-8">
                            {/* Question Count Slider */}
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="font-medium text-slate-700 dark:text-slate-300">Number of Questions</label>
                                    <span className="font-bold text-primary text-lg">{questionCount[0]}</span>
                                </div>
                                <Slider 
                                    value={questionCount} 
                                    onValueChange={setQuestionCount} 
                                    max={50} 
                                    min={5} 
                                    step={5}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>5</span>
                                    <span>50</span>
                                </div>
                            </div>

                            {/* Difficulty Selection */}
                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-3">Difficulty Level</label>
                                <div className="flex gap-2">
                                    {['easy', 'medium', 'hard', 'adaptive'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level as any)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${
                                                difficulty === level
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Limit Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Enable Time Limit</h4>
                                        <p className="text-xs text-slate-500">Auto-calculate based on question count.</p>
                                    </div>
                                </div>
                                <Switch checked={timeLimit} onCheckedChange={setTimeLimit} />
                            </div>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" /> Select Mode
                        </h2>
                        <div className="space-y-3">
                            {modes.map((m) => (
                                <div 
                                    key={m.id}
                                    onClick={() => setMode(m.id as any)}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                                        mode === m.id 
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${
                                        mode === m.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                        <m.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{m.title}</h3>
                                        <p className="text-xs text-slate-500">{m.desc}</p>
                                    </div>
                                    {mode === m.id && (
                                        <div className="text-primary">
                                            <div className="w-4 h-4 rounded-full border-[5px] border-primary"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Summary Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Session Summary</h3>
                            <p className="text-sm text-slate-500">Review your exam configuration</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Source</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {sourceType === 'ai' ? 'AI Topic' : (sourceType === 'deck' ? 'Flashcard Deck' : 'Study Plan')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Selection</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {sourceType === 'ai' ? `${selectedSubject} - ${selectedTopic}` : (sourceType === 'deck' ? selectedDeck : selectedPlan)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Questions</span>
                                <span className="font-medium text-slate-900 dark:text-white">{questionCount[0]} Questions</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium text-slate-900 dark:text-white">{timeLimit ? `~${Math.round(questionCount[0] * 1.5)} Mins` : 'Unlimited'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Difficulty</span>
                                <span className="font-medium capitalize text-slate-900 dark:text-white">{difficulty}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Mode</span>
                                <span className="font-medium text-slate-900 dark:text-white capitalize">
                                    {mode}
                                </span>
                            </div>
                        </div>

                        {difficulty === 'adaptive' && (
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-6 flex gap-3">
                                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                    <strong>AI Adaptive Mode:</strong> Questions will get harder as you answer correctly to find your true skill level.
                                </p>
                            </div>
                        )}

                        <Button 
                            disabled={isGenerating || (sourceType === 'ai' && !selectedSubject)} 
                            onClick={handleStartExam}
                            className="w-full py-6 text-base font-bold shadow-lg shadow-primary/25 group relative" 
                        >
                            {isGenerating ? (
                               <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Generating...
                               </>
                            ) : (
                               <>
                                  Start Exam <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                               </>
                            )}
                        </Button>

                        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                             Results will be saved to your dashboard
                        </p>

                        <div className="mt-4 text-center">
                          {(!user?.plan || user.plan === 'free') ? (
                              <p className="text-sm text-slate-500">
                                <b>Free Plan Limit:</b> 1 Mock Exam per day. <Link to="/student/settings" className="text-primary font-medium hover:underline">Upgrade to Pro</Link> for unlimited practice!
                              </p>
                          ) : (
                              <p className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-2 px-4 rounded-lg inline-block">
                                ✨ Pro Plan: Unlimited Mock Exams
                              </p>
                          )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
