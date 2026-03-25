import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, Video, BrainCircuit, Loader2, FileText, FileQuestion, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getModel } from '@/lib/ai';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

type ModuleItem = {
  id: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  fileUrl?: string;
  questions?: any[]; // for quizzes
};

type CourseModule = {
  id: string;
  title: string;
  items: ModuleItem[];
};

export const CourseCreationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Persistent State hook for steps
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('courseCreationStep');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const isPremium = user?.teacherSubscriptionPlan === 'premium_tools';

  // Persistent State for FormData
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('courseCreationData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved course data");
      }
    }
    return {
      title: '',
      subject: '',
      level: 'secondary',
      description: '',
      price: 0,
      thumbnailUrl: '',
      promoVideoUrl: '',
      modules: [] as CourseModule[],
    };
  });

  useEffect(() => {
    localStorage.setItem('courseCreationStep', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('courseCreationData', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File | null, typeContext: string, onComplete: (url: string) => void) => {
    if (!file || !user) return;
    
    // File validation
    if (typeContext.includes('video') && !file.type.startsWith('video/')) {
        return toast.error("Please upload a valid video file.");
    }
    if (typeContext.includes('pdf') && file.type !== 'application/pdf') {
        return toast.error("Please upload a PDF file.");
    }
    if (typeContext.includes('image') && !file.type.startsWith('image/')) {
        return toast.error("Please upload an image file.");
    }

    const storageRef = ref(storage, `courses/${user.uid}/${typeContext}/${uuidv4()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({ ...prev, [typeContext]: progress }));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error('File upload failed!');
        setUploadProgress(prev => { const newP = {...prev}; delete newP[typeContext]; return newP; });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onComplete(downloadURL);
        toast.success("File uploaded successfully");
        setUploadProgress(prev => { const newP = {...prev}; delete newP[typeContext]; return newP; });
      }
    );
  };

  const steps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Curriculum' },
    { num: 3, title: 'Media' },
    { num: 4, title: 'Publish' },
  ];

  const handleNext = () => {
    // Step 1 Validation
    if (step === 1) {
      if (!formData.title.trim()) return toast.error("Please enter a course title.");
      if (!formData.subject.trim()) return toast.error("Please enter a course subject.");
      if (!formData.description.trim()) return toast.error("Please enter a course description.");
    }
    
    // Step 2 Validation
    if (step === 2) {
      if (formData.modules.length === 0) return toast.error("Please add at least one module to your curriculum.");
      const hasEmptyModule = formData.modules.some((m: CourseModule) => !m.title.trim());
      if (hasEmptyModule) return toast.error("All modules must have a title.");
    }

    // Step 3 Validation
    if (step === 3) {
      if (!formData.thumbnailUrl) return toast.error("Please upload a course thumbnail before proceeding.");
    }

    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleGenerateCurriculum = async () => {
    if (!formData.title || !formData.subject) {
      toast.error('Please enter a course title and subject first.');
      setStep(1);
      return;
    }
    
    setIsGenerating(true);

    try {
      const normalizedTitle = formData.title.trim().toLowerCase();
      const normalizedSubject = formData.subject.trim().toLowerCase();

      // Check Smart Pool
      const poolRef = collection(db, 'smart_pool_curriculums');
      const q = query(
        poolRef,
        where('subject', '==', normalizedSubject),
        where('level', '==', formData.level),
        where('title', '==', normalizedTitle)
      );

      const poolSnapshot = await getDocs(q);
      if (!poolSnapshot.empty) {
        const cachedData = poolSnapshot.docs[0].data();
        const processedModules = cachedData.modules.map((m: any) => ({
            id: uuidv4(),
            title: m.title || 'Untitled Module',
            items: [] 
        }));
        updateField('modules', processedModules);
        toast.success('Curriculum retrieved from smart pool!');
        setStep(2);
        setIsGenerating(false);
        return;
      }
    } catch (e) {
       console.error("Smart pool error:", e);
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const prompt = `Generate a 4-module curriculum for a course titled "${formData.title}" in the subject "${formData.subject}" for ${formData.level} level students. 
        Return ONLY a complete, valid JSON array of module objects. Each module object must have two properties: 'title' (string) and 'items' (an array of empty items. Just return an empty array for items: []). Do not include any other markdown or text. Ensure the JSON is well-formed. Example: [{"title": "Module 1", "items": []}]`;

        const model = getModel({ jsonMode: true, temperature: 0.7 });
        const response = await model.generateContent(prompt);
        const output = response.response.text();
        
        const parsedModules = JSON.parse(output);
        
        if (!Array.isArray(parsedModules)) {
             throw new Error("AI returned invalid JSON format (not an array)");
        }

        const processedModules = parsedModules.map(m => ({
            id: uuidv4(),
            title: m.title || 'Untitled Module',
            items: []
        }));

        updateField('modules', processedModules);
        toast.success('Curriculum generated successfully!');
        setStep(2); // Jump to Curriculum tab to view it

        // Save to Smart Pool
        try {
           const poolRef = collection(db, 'smart_pool_curriculums');
           await addDoc(poolRef, {
              subject: formData.subject.trim().toLowerCase(),
              level: formData.level,
              title: formData.title.trim().toLowerCase(),
              modules: parsedModules,
              createdAt: serverTimestamp(),
              createdBy: user?.uid || 'unknown'
           });
        } catch (e) {
           console.error("Could not save to smart pool", e);
        }

        break; // Success, exit loop
      } catch (error) {
        console.error(`AI Generation Error (Attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
            toast.error('Failed to generate curriculum after multiple attempts. Please try again.');
        } else {
             // Smart pooling delay before retry
            await new Promise(r => setTimeout(r, 2000 * attempts));
        }
      }
    }
    setIsGenerating(false);
  };

  const handleGenerateQuiz = async (moduleId: string, moduleTitle: string) => {
    setIsGeneratingQuiz(moduleId);

    try {
      const normalizedSubject = formData.subject.trim().toLowerCase();
      const normalizedModuleTitle = moduleTitle.trim().toLowerCase();

      const poolRef = collection(db, 'smart_pool_quizzes');
      const q = query(
        poolRef,
        where('subject', '==', normalizedSubject),
        where('level', '==', formData.level),
        where('moduleTitle', '==', normalizedModuleTitle)
      );

      const poolSnapshot = await getDocs(q);
      if (!poolSnapshot.empty) {
        const cachedData = poolSnapshot.docs[0].data();
        
        const newQuizItem: ModuleItem = {
            id: uuidv4(),
            type: 'quiz',
            title: `${moduleTitle} Quiz`,
            questions: cachedData.questions
        };

        const updatedModules = formData.modules.map(mod => 
            mod.id === moduleId 
                ? { ...mod, items: [...mod.items, newQuizItem] } 
                : mod
        );
        
        updateField('modules', updatedModules);
        toast.success("Quiz retrieved from smart pool!");
        setIsGeneratingQuiz(null);
        return;
      }
    } catch (e) {
      console.error("Smart pool error:", e);
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const prompt = `Generate a 3-question multiple choice quiz for a specific module in a ${formData.level} level ${formData.subject} course.
        The module title is: "${moduleTitle}". The overall course title is "${formData.title}".
        Return ONLY a complete, valid JSON array of question objects. 
        Each object must exactly match this format:
        { "question": "The question text?", "options": ["A", "B", "C", "D"], "correctAnswer": "The exact string from options" }
        Do not include any other markdown or text.`;

        const model = getModel({ jsonMode: true, temperature: 0.7 });
        const response = await model.generateContent(prompt);
        const output = response.response.text();
        
        const questions = JSON.parse(output);

        if (!Array.isArray(questions)) {
            throw new Error("AI returned invalid JSON format");
        }
        
        const newQuizItem: ModuleItem = {
            id: uuidv4(),
            type: 'quiz',
            title: `${moduleTitle} Quiz`,
            questions: questions
        };

        const updatedModules = formData.modules.map(mod => 
            mod.id === moduleId 
                ? { ...mod, items: [...mod.items, newQuizItem] } 
                : mod
        );
        
        updateField('modules', updatedModules);
        toast.success("Quiz generated successfully!");

        // Save to smart pool
        try {
           const poolRef = collection(db, 'smart_pool_quizzes');
           await addDoc(poolRef, {
              subject: formData.subject.trim().toLowerCase(),
              level: formData.level,
              moduleTitle: moduleTitle.trim().toLowerCase(),
              questions: questions,
              createdAt: serverTimestamp(),
              createdBy: user?.uid || 'unknown'
           });
        } catch (e) {
           console.error("Could not save quiz to smart pool", e);
        }

        break;
      } catch (error) {
        console.error(`AI Quiz Error (Attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
            toast.error('Failed to generate quiz. Please try again.');
        } else {
            await new Promise(r => setTimeout(r, 2000 * attempts));
        }
      }
    }
    setIsGeneratingQuiz(null);
  };

  const handlePublish = async () => {
    // Step 4 Validation
    if (formData.price < 0) return toast.error("Price cannot be negative.");
    if (!formData.thumbnailUrl) return toast.error("Please add a course thumbnail.");
    if (!formData.title) return toast.error("Please add a course title.");
    if (formData.modules.length === 0) return toast.error("Course must have at least one module.");
    
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error("You must be logged in to test this!");
        return;
      }

      await addDoc(collection(db, 'courses'), {
        ...formData,
        teacherId: user.uid,
        teacherName: user.displayName || 'Unknown Teacher',
        status: 'pending', // or 'published' based on your requirements
        createdAt: serverTimestamp(),
        enrollmentCount: 0,
        rating: 0
      });

      // Clear the local storage draft after successful submission
      localStorage.removeItem('courseCreationStep');
      localStorage.removeItem('courseCreationData');
      
      toast.success("Course draft saved and submitted for review!");
      navigate('/teacher/courses');
    } catch (error) {
      console.error("Error publishing course:", error);
      toast.error('Failed to submit course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Create New Course</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design your curriculum and reach students globally.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Save Draft</Button>
          <Button disabled={step !== 4 || isSubmitting} onClick={handlePublish}>
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Wizard Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          
          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-10 relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-10 transform -translate-y-1/2"></div>
            <div 
              className="absolute left-0 top-1/2 h-1 bg-primary rounded-full -z-10 transform -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {steps.map((s) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white dark:bg-slate-900 border-2",
                    isPast ? "border-primary bg-primary text-white" :
                    isCurrent ? "border-primary text-primary shadow-[0_0_0_4px_rgba(22,163,74,0.1)]" :
                    "border-slate-200 dark:border-slate-700 text-slate-400"
                  )}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-sm">{s.num}</span>}
                  </div>
                  <span className={cn(
                    "text-xs font-bold hidden sm:block",
                    isCurrent || isPast ? "text-slate-900 dark:text-white" : "text-slate-400"
                  )}>{s.title}</span>
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <h2 className="text-xl font-bold font-display">1. Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Course Title</label>
                    <Input 
                      placeholder="e.g. Master JAMB Mathematics 2026" 
                      value={formData.title} 
                      onChange={(e) => updateField('title', e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Subject</label>
                      <Input 
                        placeholder="e.g. Mathematics, Economics, Biology" 
                        value={formData.subject} 
                        onChange={(e) => updateField('subject', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Academic Level</label>
                      <select 
                        className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.level}
                        onChange={(e) => updateField('level', e.target.value)}
                      >
                        <option value="secondary">Secondary (WAEC/JAMB)</option>
                        <option value="tertiary">Tertiary (University)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Course Description</label>
                    <textarea 
                      className="w-full h-32 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                      placeholder="What will students learn in this course?"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-display">2. Curriculum Structure</h2>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        updateField('modules', [...formData.modules, { id: uuidv4(), title: 'New Module', items: [] }]);
                    }}>
                      <span className="material-symbols-outlined text-sm">add</span> Add Module
                    </Button>
                 </div>
                 
                 {formData.modules.length === 0 ? (
                   <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center text-slate-500">
                       <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Video className="w-6 h-6 text-slate-400" />
                       </div>
                       <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Your curriculum is empty</p>
                       <p className="text-sm">Start laying out your course sections and lectures, or use the AI Curriculum Builder.</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {formData.modules.map((module, mIdx) => (
                       <div key={mIdx} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex justify-between items-center mb-3">
                             <Input 
                               value={module.title}
                               onChange={(e) => {
                                 const newModules = formData.modules.map(m => m.id === module.id ? { ...m, title: e.target.value } : m);
                                 updateField('modules', newModules);
                               }}
                               className="font-bold text-lg max-w-sm border-transparent bg-transparent hover:border-slate-200 focus:bg-white dark:focus:bg-slate-900"
                             />
                             <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => {
                               const newModules = formData.modules.filter(m => m.id !== module.id);
                               updateField('modules', newModules);
                             }}>
                               Remove
                             </Button>
                          </div>
                          
                          {/* Module Items */}
                          <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2 mt-4">
                             {module.items?.map((item, iIdx) => (
                               <div key={item.id} className="flex items-start gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                  <div className="mt-1">
                                    {item.type === 'video' && <Video className="w-5 h-5 text-blue-500 shrink-0" />}
                                    {item.type === 'pdf' && <FileText className="w-5 h-5 text-rose-500 shrink-0" />}
                                    {item.type === 'quiz' && <FileQuestion className="w-5 h-5 text-emerald-500 shrink-0" />}
                                  </div>
                                  <div className="flex-grow space-y-2">
                                     <div className="flex justify-between items-start gap-2">
                                        <Input 
                                          value={item.title}
                                          placeholder={`${module.title} ${item.type === 'pdf' ? 'PDF' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}`}
                                          onChange={(e) => {
                                            const newModules = [...formData.modules];
                                            const modIndex = newModules.findIndex(m => m.id === module.id);
                                            newModules[modIndex].items[iIdx].title = e.target.value;
                                            updateField('modules', newModules);
                                          }}
                                          className="h-8 font-medium text-sm border-transparent bg-transparent hover:border-slate-200 focus:bg-slate-50 dark:focus:bg-slate-950 px-2"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => {
                                            const newModules = [...formData.modules];
                                            const modIndex = newModules.findIndex(m => m.id === module.id);
                                            newModules[modIndex].items = newModules[modIndex].items.filter(it => it.id !== item.id);
                                            updateField('modules', newModules);
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                     </div>

                                     {/* Item specific content UI */}
                                     {item.type !== 'quiz' && (
                                        <div className="flex flex-col gap-2 pt-1 pl-2">
                                            {item.fileUrl ? (
                                                <div className="text-xs flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                                    <CheckCircle2 className="w-3 h-3" /> File uploaded successfully
                                                </div>
                                            ) : (
                                                <label className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 cursor-pointer bg-primary/5 p-2 rounded-md w-fit border border-primary/20">
                                                    <UploadCloud className="w-3.5 h-3.5" /> 
                                                    {uploadProgress[item.id] !== undefined ? `Uploading ${Math.round(uploadProgress[item.id])}%` : `Upload ${item.type.toUpperCase()}`}
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept={item.type === 'video' ? 'video/*' : 'application/pdf'} 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            // Temporarily use item.id as context key for progress tracking
                                                            handleFileUpload(file, item.id, (url) => {
                                                                const newModules = [...formData.modules];
                                                                const mIdx = newModules.findIndex(m => m.id === module.id);
                                                                newModules[mIdx].items[iIdx].fileUrl = url;
                                                                updateField('modules', newModules);
                                                            });
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                     )}

                                     {item.type === 'quiz' && item.questions && (
                                         <div className="pl-2 pt-1">
                                             <p className="text-xs text-slate-500 font-medium">{item.questions.length} questions mapped.</p>
                                         </div>
                                     )}
                                  </div>
                               </div>
                             ))}
                          </div>

                          {/* Add Item Actions */}
                          <div className="flex flex-wrap items-center gap-2 mt-4 ml-6">
                             <Button variant="outline" size="sm" className="h-8 text-xs border-dashed gap-1.5" onClick={() => {
                               const newModules = [...formData.modules];
                               const modIndex = newModules.findIndex(m => m.id === module.id);
                               newModules[modIndex].items.push({ id: uuidv4(), type: 'video', title: '' });
                               updateField('modules', newModules);
                             }}>
                               <Video className="w-3 h-3" /> Add Video
                             </Button>
                             
                             <Button variant="outline" size="sm" className="h-8 text-xs border-dashed gap-1.5" onClick={() => {
                               const newModules = [...formData.modules];
                               const modIndex = newModules.findIndex(m => m.id === module.id);
                               newModules[modIndex].items.push({ id: uuidv4(), type: 'pdf', title: '' });
                               updateField('modules', newModules);
                             }}>
                               <FileText className="w-3 h-3" /> Add Document
                             </Button>

                             {isPremium && (
                               <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800 gap-1.5"
                                  disabled={isGeneratingQuiz === module.id}
                                  onClick={() => handleGenerateQuiz(module.id, module.title)}
                               >
                                  {isGeneratingQuiz === module.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                  {isGeneratingQuiz === module.id ? 'Generating...' : 'AI Quiz'}
                               </Button>
                             )}
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                 <h2 className="text-xl font-bold font-display">3. Media Uploads</h2>
                 
                 <div className="space-y-6">
                    <div>
                       <label className="text-sm font-medium mb-1.5 block">Course Thumbnail</label>
                       <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {formData.thumbnailUrl ? (
                            <div className="text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 mx-auto" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Thumbnail Uploaded</span>
                            </div>
                          ) : (
                            <>
                                <UploadCloud className="w-8 h-8 text-primary mb-3" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {uploadProgress['thumbnail'] !== undefined ? `Uploading ${Math.round(uploadProgress['thumbnail'])}%` : 'Upload Image'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">1280x720px (16:9 ratio)</p>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                             handleFileUpload(e.target.files?.[0] || null, 'thumbnail', (url) => updateField('thumbnailUrl', url));
                          }} />
                       </label>
                    </div>

                    <div>
                       <label className="text-sm font-medium mb-1.5 flex justify-between">
                          Promo Video (Optional)
                          <span className="text-xs text-slate-400 font-normal">Max 2 minutes</span>
                       </label>
                       <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {formData.promoVideoUrl ? (
                            <div className="text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 mx-auto" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Video Uploaded</span>
                            </div>
                          ) : (
                            <>
                                <Video className="w-8 h-8 text-slate-400 mb-3" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {uploadProgress['promoVideo'] !== undefined ? `Uploading ${Math.round(uploadProgress['promoVideo'])}%` : 'Upload Promo Video'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">MP4 or MOV</p>
                            </>
                          )}
                          <input type="file" className="hidden" accept="video/*" onChange={(e) => {
                             handleFileUpload(e.target.files?.[0] || null, 'promoVideo', (url) => updateField('promoVideoUrl', url));
                          }}/>
                       </label>
                    </div>
                 </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                 <h2 className="text-xl font-bold font-display">4. Pricing & Options</h2>
                 
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                       <label className="text-sm font-bold mb-1.5 block">Course Price (₦)</label>
                       <p className="text-xs text-slate-500 mb-3">Set to 0 to offer this course for free.</p>
                       <Input 
                          type="number" 
                          min="0" 
                          placeholder="e.g. 5000"
                          value={formData.price}
                          onChange={(e) => updateField('price', parseInt(e.target.value))}
                          className="max-w-md text-lg font-bold"
                       />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                       <h4 className="text-sm font-bold mb-2">Platform Fee Deduction</h4>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Your Base Rate</span>
                          <span className="font-semibold">{((1 - (user?.currentCommissionRate || 0.15)) * 100).toFixed(0)}% Payout</span>
                       </div>
                    </div>
                 </div>

                 {isPremium && (
                   <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                         <h4 className="font-bold text-primary text-sm">Premium Feature: Priority Listing</h4>
                         <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">As a Premium Creator, this course will automatically be boosted in search results when approved.</p>
                      </div>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
             <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
               <ChevronLeft className="w-4 h-4 mr-1" /> Back
             </Button>
             
             {step < 4 ? (
               <Button onClick={handleNext}>
                 Continue <ChevronRight className="w-4 h-4 ml-1" />
               </Button>
             ) : (
               <Button onClick={handlePublish} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                 {isSubmitting ? 'Processing...' : 'Submit Course'} <CheckCircle2 className="w-4 h-4 ml-1" />
               </Button>
             )}
          </div>
        </div>

        {/* Sidebar Tools */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Builder Widget — GATED FOR PREMIUM */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:border dark:border-slate-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-bold text-lg font-display">AI Curriculum Builder</h3>
                </div>
                
                {!isPremium ? (
                  <div className="text-center mt-2">
                     <span className="inline-block p-2 bg-white/10 rounded-full mb-3">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                     </span>
                     <p className="text-sm text-slate-300 mb-4 text-left">Generate complete syllabuses, video scripts, and quizzes instantly based on your subject.</p>
                     <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg" onClick={() => navigate('/teacher/dashboard')}>
                        Upgrade to Unlock
                     </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 text-sm mb-4">I can instantly structure a curriculum for you based on the title.</p>
                    <Button 
                       disabled={isGenerating} 
                       onClick={handleGenerateCurriculum}
                       className="w-full bg-white text-slate-900 hover:bg-slate-100 border-0 font-bold shadow-lg shadow-white/10"
                    >
                       {isGenerating ? (
                         <>
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                         </>
                       ) : (
                         'Generate Now'
                       )}
                    </Button>
                  </div>
                )}
             </div>
          </div>

          {/* Quality Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quality Checklist</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Fill Basic Information</span>
              </li>
              <li className={cn("flex items-start gap-2", step >= 2 ? "text-primary" : "text-slate-400")}>
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Add Curriculum Content</span>
              </li>
              <li className={cn("flex items-start gap-2", step >= 3 ? "text-primary" : "text-slate-400")}>
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Upload Course Media</span>
              </li>
              <li className={cn("flex items-start gap-2", step >= 4 ? "text-primary" : "text-slate-400")}>
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Set Pricing</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
