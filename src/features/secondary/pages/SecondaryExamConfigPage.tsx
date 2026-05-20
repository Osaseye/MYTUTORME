import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Clock,
  Settings,
  Layers,
  Sparkles,
  ChevronRight,
  Loader2,
  UploadCloud,
  X,
  FileText,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useExamGenerator } from '@/features/student/hooks/useExamGenerator';
import { uploadFilesToStorage } from '@/utils/storageUploadService';

const SECONDARY_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Further Mathematics',
  'Literature in English',
  'Government',
  'Accounting',
  'Commerce',
  'Geography',
  'Agricultural Science',
  'Civic Education',
  'Technical Drawing',
  'French',
  'Computer Science',
  'General Mathematics',
  'Financial Accounting',
  'History',
  'Christian Religious Studies',
  'Islamic Religious Studies',
];

const EXAM_TYPES = ['WAEC', 'NECO', 'JAMB', 'Pre-UTME', 'General'];

const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const [url, setUrl] = useState('');
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
          <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{file.name}</span>
        </div>
      )}
      <div
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const SecondaryExamConfigPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { generateExam, isGenerating } = useExamGenerator();

  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [userPlans, setUserPlans] = useState<any[]>([]);

  const [sourceType, setSourceType] = useState<'ai' | 'deck' | 'plan'>('ai');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>(
    searchParams.get('exam') ?? 'WAEC',
  );
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questionCount, setQuestionCount] = useState([20]);
  const [questionType, setQuestionType] = useState<'mcq' | 'theory' | 'mixed'>('mcq');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium');
  const [mode, setMode] = useState<'standard' | 'practice'>('standard');
  const [timeLimit, setTimeLimit] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    const fetchResources = async () => {
      try {
        const dSnap = await getDocs(
          query(collection(db, 'flashcard_decks'), where('userId', '==', user.uid)),
        );
        const decks = dSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUserDecks(decks);
        if (decks.length > 0) setSelectedDeck((decks[0] as any).title);

        const pSnap = await getDocs(
          query(collection(db, 'study_plans'), where('userId', '==', user.uid)),
        );
        const plans = pSnap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, ...data, title: data.title || `${data.subject || 'General'} Study Plan` };
        });
        setUserPlans(plans);
        if (plans.length > 0) setSelectedPlan(plans[0].title);
      } catch (err) {
        console.error('Failed to load user resources', err);
      }
    };
    fetchResources();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const nextFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...nextFiles]);
    setUploadedFileCount(0);
    toast.success(`${nextFiles.length} file${nextFiles.length > 1 ? 's' : ''} selected.`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedFileCount(0);
  };

  const handleStartExam = async () => {
    try {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().activeExamId) {
          const activeExamId = userDoc.data().activeExamId;
          toast.error('You have an incomplete exam. Please finish it first!', {
            action: {
              label: 'Resume',
              onClick: () => navigate(`/secondary/exam-prep/active/${activeExamId}`),
            },
          });
          return;
        }
      }
    } catch (err) {
      console.error('Error checking active exam status', err);
    }

    let finalSub = selectedSubject;
    let finalTop = selectedTopic;

    if (sourceType === 'deck') {
      if (!selectedDeck) {
        toast.error('Please select a deck.');
        return;
      }
      finalSub = 'Flashcard Deck';
      finalTop = selectedDeck;
    } else if (sourceType === 'plan') {
      if (!selectedPlan) {
        toast.error('Please select a study plan.');
        return;
      }
      finalSub = 'Study Plan';
      finalTop = selectedPlan;
    } else {
      if (!selectedSubject || !selectedTopic) {
        toast.error('Please enter both a subject and a topic.');
        return;
      }
    }

    // Prefix topic with exam type for targeted generation
    if (sourceType === 'ai' && selectedExamType && selectedExamType !== 'General') {
      finalTop = `${selectedExamType}: ${finalTop}`;
    }

    const loadingToastId = toast.loading('Generating your exam... Please wait.');
    try {
      let fileDataForApi: any[] | undefined;

      if (selectedFiles.length > 0 && user) {
        try {
          setIsUploadingFiles(true);
          const storagePaths = await uploadFilesToStorage(selectedFiles, user.uid, 'exam-uploads');
          setUploadedFileCount(storagePaths.length);
          fileDataForApi = selectedFiles.map((file, index) => ({
            storagePath: storagePaths[index],
            mimeType: file.type || 'application/octet-stream',
          }));
        } catch (error: any) {
          toast.error('File upload failed: ' + error.message, { id: loadingToastId });
          return;
        } finally {
          setIsUploadingFiles(false);
        }
      }

      const quizId = await generateExam({
        subject: finalSub,
        topic: finalTop,
        difficulty,
        count: questionCount[0],
        mode,
        questionType,
        fileData: fileDataForApi,
      });

      if (quizId) {
        toast.success('Exam generated!', { id: loadingToastId });
        navigate(`/secondary/exam-prep/active/${quizId}`);
      } else {
        toast.error('Could not generate exam. Try a different topic.', { id: loadingToastId });
      }
    } catch {
      toast.error('An error occurred during generation.', { id: loadingToastId });
    }
  };

  const modes = [
    { id: 'standard', title: 'Standard Exam', desc: 'Timed, simulates real exam conditions.', icon: Clock },
    { id: 'practice', title: 'Practice Mode', desc: 'See answers immediately after each question.', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-12 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/secondary/exam-prep"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
        >
          &larr; Back to Exam Hub
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">
            Configure Mock Exam
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Practice WAEC, NECO, JAMB and Pre-UTME style questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Source Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Exam Source
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'ai', label: 'AI Generator' },
                  { id: 'deck', label: 'Flashcard Deck' },
                  { id: 'plan', label: 'Study Plan' },
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
                <div className="space-y-4">
                  {/* Exam type */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Target className="w-4 h-4" /> Exam Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EXAM_TYPES.map((et) => (
                        <button
                          key={et}
                          onClick={() => setSelectedExamType(et)}
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                            selectedExamType === et
                              ? 'border-primary bg-primary text-white'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40'
                          }`}
                        >
                          {et}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      list="secondary-subjects-list"
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setSelectedTopic('');
                      }}
                      placeholder="e.g. Mathematics"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                    />
                    <datalist id="secondary-subjects-list">
                      {SECONDARY_SUBJECTS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  {selectedSubject && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Topic
                      </label>
                      <input
                        type="text"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        placeholder="e.g. Quadratic equations, Photosynthesis"
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* File upload */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-primary" /> Upload Past Questions (Optional)
                    </h2>
                    <p className="text-xs text-slate-500 mb-3">
                      Upload past question papers for more targeted questions.
                    </p>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col items-center gap-2"
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Click to upload images/documents
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*,.pdf,.txt,.doc,.docx"
                        multiple
                        onChange={handleFileChange}
                      />
                    </div>
                    {selectedFiles.length > 0 && (
                      <>
                        <div className="mt-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                          {isUploadingFiles
                            ? `Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}...`
                            : uploadedFileCount > 0
                            ? `${uploadedFileCount} file${uploadedFileCount > 1 ? 's' : ''} uploaded.`
                            : `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} ready.`}
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedFiles.map((file, idx) => (
                            <FilePreview key={idx} file={file} onRemove={() => removeFile(idx)} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {sourceType === 'deck' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Select Flashcard Deck
                  </label>
                  <select
                    value={selectedDeck}
                    onChange={(e) => setSelectedDeck(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                  >
                    {userDecks.length > 0 ? (
                      userDecks.map((deck) => (
                        <option key={deck.id} value={deck.title}>
                          {deck.title}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No flashcard decks found
                      </option>
                    )}
                  </select>
                </div>
              )}

              {sourceType === 'plan' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Select Study Plan
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                  >
                    {userPlans.length > 0 ? (
                      userPlans.map((plan) => (
                        <option key={plan.id} value={plan.title}>
                          {plan.title}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No study plans found
                      </option>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Exam Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Exam Settings
              </h2>

              <div className="space-y-8">
                {/* Question Count */}
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="font-medium text-slate-700 dark:text-slate-300">
                      Number of Questions
                    </label>
                    <span className="font-bold text-primary text-lg">{questionCount[0]}</span>
                  </div>
                  <Slider
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    max={60}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>5</span>
                    <span>60</span>
                  </div>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Question Type
                  </label>
                  <div className="flex gap-2">
                    {(['mcq', 'theory', 'mixed'] as const).map((val) => (
                      <button
                        key={val}
                        onClick={() => setQuestionType(val)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                          questionType === val
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {val === 'mcq' ? 'MCQ' : val === 'theory' ? 'Theory' : 'Mixed'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard', 'adaptive'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
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

                {/* Time limit */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">Enable Time Limit</p>
                    <p className="text-xs text-slate-500">Simulate real exam pressure</p>
                  </div>
                  <Switch checked={timeLimit} onCheckedChange={setTimeLimit} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Exam Mode */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Exam Mode
              </h2>
              <div className="space-y-3">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      mode === m.id
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <m.icon
                        className={`w-5 h-5 ${mode === m.id ? 'text-primary' : 'text-slate-400'}`}
                      />
                      <div>
                        <p className={`text-sm font-bold ${mode === m.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                          {m.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary + Start */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Summary</h2>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Exam type</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedExamType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate ml-2">
                    {selectedSubject || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{questionCount[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{difficulty}</span>
                </div>
              </div>
              <Button
                onClick={handleStartExam}
                disabled={isGenerating || isUploadingFiles}
                className="w-full gap-2"
              >
                {isGenerating || isUploadingFiles ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isUploadingFiles ? 'Uploading files...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    Start Exam <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
