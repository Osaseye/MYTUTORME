import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Layers, AlignLeft, Wand2, BookMarked, FileText, Lightbulb,
  Target, ScanSearch, ChevronDown, Paperclip, Copy, Download,
  BookOpen, Zap, Bot, GraduationCap, TrendingUp, AlertTriangle,
  Loader2, X, History, Clock, Trash2, Send, Sigma, CheckCircle2,
  ChevronRight, BarChart2, FileEdit,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, getDocs, deleteDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { functions, db } from '@/lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { usePlanGate } from '@/hooks/usePlanGate';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { uploadFileToStorage } from '@/utils/storageUploadService';
import { FreePlanUsageCard } from '@/components/shared/FreePlanUsageCard';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Mode =
  | 'breakdown' | 'expand' | 'humanize'
  | 'citations' | 'summarize' | 'eli5'
  | 'quality-score' | 'ai-check';

type HumanizeLevel = 'subtle' | 'moderate' | 'strong';

interface HistoryItem {
  id: string;
  question: string;
  result: string;
  mode: Mode;
  date: string;
}

interface NextStep {
  id: string;
  label: string;
  icon: React.ElementType;
  primary?: boolean;
  urgent?: boolean;
  action: () => void;
}

interface AICheckResult {
  patternScore: number;
  structureScore: number;
  vocabularyScore: number;
  burstnessScore: number;
  totalScore: number;
  riskLevel: 'human' | 'likely-human' | 'mixed' | 'likely-ai' | 'ai-generated';
  confidence: 'low' | 'medium' | 'high';
  flaggedPhrases: string[];
  analysis: string;
  suggestions: string[];
}

interface QualityResult {
  clarityScore: number;
  grammarScore: number;
  argumentScore: number;
  referencingScore: number;
  overallScore: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  summary: string;
}

// â”€â”€â”€ Mode config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MODE_GROUPS = [
  {
    group: 'Writing Help',
    items: [
      { key: 'breakdown' as Mode, label: 'Smart Breakdown', icon: Layers, desc: 'Break any assignment into sections, word counts & research topics' },
      { key: 'expand' as Mode, label: 'Essay Expander', icon: AlignLeft, desc: 'Turn bullet points into full academic paragraphs' },
      { key: 'humanize' as Mode, label: 'Humanizer', icon: Wand2, desc: 'Rewrite AI-generated text to sound naturally human' },
    ],
  },
  {
    group: 'Research & Understanding',
    items: [
      { key: 'citations' as Mode, label: 'Auto Citations', icon: BookMarked, desc: 'Generate APA, MLA & Harvard citations instantly' },
      { key: 'summarize' as Mode, label: 'Summarizer', icon: FileText, desc: 'Condense long texts into key points and core argument' },
      { key: 'eli5' as Mode, label: "Explain Like I'm 5", icon: Lightbulb, desc: 'Understand any complex concept in plain, simple language' },
    ],
  },
  {
    group: 'Review & Polish',
    items: [
      { key: 'quality-score' as Mode, label: 'Quality Score', icon: Target, desc: 'Score your draft on clarity, grammar, argument & referencing' },
      { key: 'ai-check' as Mode, label: 'AI Content Check', icon: ScanSearch, desc: 'Detect how AI-generated your text appears to reviewers' },
    ],
  },
];

const ALL_MODES = MODE_GROUPS.flatMap(g => g.items);
const getModeConfig = (mode: Mode) => ALL_MODES.find(m => m.key === mode) ?? ALL_MODES[0];

const getPlaceholder = (mode: Mode): string => ({
  breakdown: 'Paste your assignment question or topic here...',
  expand: 'Paste your bullet points or outline to expand into paragraphs...',
  humanize: 'Paste the AI-generated text you want to humanize...',
  citations: 'Paste a URL, book title, or source details to generate citations...',
  summarize: 'Paste the article or long text you want to summarize...',
  eli5: 'Paste the complex concept or text you want explained simply...',
  'quality-score': 'Paste your written draft or essay here for scoring...',
  'ai-check': 'Paste your text to check for AI-generated content...',
}[mode]);

const getSubmitLabel = (mode: Mode, analyzing: boolean): string => {
  if (analyzing) return { breakdown: 'Breaking down...', expand: 'Expanding...', humanize: 'Humanizing...', citations: 'Generating...', summarize: 'Summarizing...', eli5: 'Explaining...', 'quality-score': 'Scoring...', 'ai-check': 'Analyzing...' }[mode];
  return { breakdown: 'Break It Down', expand: 'Expand Essay', humanize: 'Humanize', citations: 'Generate Citations', summarize: 'Summarize', eli5: 'Explain This', 'quality-score': 'Score My Work', 'ai-check': 'Check AI Content' }[mode];
};

// â”€â”€â”€ Small sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CircularGauge = ({ score }: { score: number }) => {
  const size = 128, sw = 10, r = (size - sw) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  const color = score > 60 ? '#ef4444' : score > 30 ? '#f59e0b' : '#22c55e';
  const label = score > 80 ? 'AI-Generated' : score > 60 ? 'Likely AI' : score > 40 ? 'Mixed' : score > 20 ? 'Likely Human' : 'Human';
  const badgeColor = score > 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : score > 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} className="dark:stroke-slate-700" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor}`}>{label}</span>
    </div>
  );
};

const DimensionBar = ({ label, score, max = 25 }: { label: string; score: number; max?: number }) => {
  const pct = (score / max) * 100;
  const color = pct > 60 ? 'bg-red-500' : pct > 35 ? 'bg-amber-400' : 'bg-green-500';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{label}</span><span className="font-medium">{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const ScoreCard = ({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) => {
  const color = score >= 8 ? 'text-green-600 dark:text-green-400' : score >= 6 ? 'text-amber-500' : 'text-red-500';
  const ring = score >= 8 ? 'border-green-200 dark:border-green-800' : score >= 6 ? 'border-amber-200 dark:border-amber-800' : 'border-red-200 dark:border-red-800';
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${ring} bg-white dark:bg-slate-900`}>
      <Icon className="w-4 h-4 text-gray-400" />
      <span className={`text-2xl font-bold ${color}`}>{score}<span className="text-sm font-normal text-gray-400">/10</span></span>
      <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
    </div>
  );
};

// â”€â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const safeParseJSON = <T,>(raw: string): T | null => {
  try {
    const stripped = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(stripped) as T;
  } catch { return null; }
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const AssignmentHelperPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSecondary = location.pathname.startsWith('/secondary');
  const base = isSecondary ? '/secondary' : '/student';

  const { hasAccess } = usePlanGate('guided_assignments');
  const { user } = useAuthStore();

  const [mode, setMode] = useState<Mode>('breakdown');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [humanizeLevel, setHumanizeLevel] = useState<HumanizeLevel>('moderate');
  const [subjectContext, setSubjectContext] = useState('');
  const [showSubjectField, setShowSubjectField] = useState(false);
  const [crunchMode, setCrunchMode] = useState(false);
  const [crunchHours, setCrunchHours] = useState(3);

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setHistoryLoading(true);
      try {
        const ref = collection(db, 'users', user.uid, 'assignmentHistory');
        const q = query(ref, orderBy('date', 'desc'), limit(20));
        const snap = await getDocs(q);
        const items: HistoryItem[] = snap.docs.map(d => {
          const data = d.data();
          const dateObj = data.date?.toDate?.();
          return {
            id: d.id,
            question: data.question || '',
            result: data.result || '',
            mode: (data.mode as Mode) || 'breakdown',
            date: dateObj
              ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : (data.date as string) || '',
          };
        });
        setHistory(items);
        setUsageCount(items.length);
      } catch {
        const saved = localStorage.getItem('assignmentHistory');
        if (saved) { try { setHistory(JSON.parse(saved)); } catch { /* ignore */ } }
      } finally { setHistoryLoading(false); }
    };
    load();
  }, [user]);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const switchModeWithContext = useCallback((newMode: Mode, inputOverride?: string) => {
    setMode(newMode);
    if (inputOverride !== undefined) { setQuestion(inputOverride); setResult(null); }
    setActiveTab('input');
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const saveToHistory = async (q: string, res: string, m: Mode) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      question: q.substring(0, 150) + (q.length > 150 ? '...' : ''),
      result: res, mode: m,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory(prev => { const updated = [newItem, ...prev].slice(0, 20); localStorage.setItem('assignmentHistory', JSON.stringify(updated)); return updated; });
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'assignmentHistory'), { question: newItem.question, result: res, mode: m, date: serverTimestamp() });
      } catch { /* non-critical */ }
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('assignmentHistory');
    if (user) {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'assignmentHistory'));
        await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      } catch { /* ignore */ }
    }
    toast.success('History cleared');
  };

  const loadFromHistory = (item: HistoryItem) => {
    setQuestion(item.question); setResult(item.result); setMode(item.mode);
    setSelectedFile(null); setShowHistoryDrawer(false); setActiveTab('output');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File size exceeds 10MB limit'); return; }
    setSelectedFile(file);
    toast.success('File attached');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!question.trim() && !selectedFile) { toast.error('Please enter a question or attach a file first'); return; }
    if (!hasAccess && usageCount >= 3) { toast.error('Free plan limit reached. Upgrade in Settings to continue.'); return; }
    setIsAnalyzing(true); setResult(null);
    try {
      let payloadFile: { storagePath: string; mimeType: string } | undefined;
      if (selectedFile) {
        if (!user) { toast.error('You must be logged in to upload files'); setIsAnalyzing(false); return; }
        try {
          const storagePath = await uploadFileToStorage(selectedFile, user.uid, 'assignment-uploads');
          payloadFile = { storagePath, mimeType: selectedFile.type || 'application/octet-stream' };
        } catch (err: any) { toast.error('Failed to upload file: ' + err.message); setIsAnalyzing(false); return; }
      }
      const payload: Record<string, unknown> = {
        question, mode,
        ...(payloadFile && { fileData: payloadFile }),
        ...(mode === 'humanize' && { humanizeLevel }),
        ...(subjectContext && { subjectContext }),
        ...(crunchMode && { crunchHours }),
      };
      const fn = httpsCallable(functions, 'processAssignmentHelp');
      const response = await fn(payload) as { data: { result: string } };
      const fullResponse = response.data?.result || 'No output was returned.';
      setResult(fullResponse); setActiveTab('output');
      setUsageCount(c => c + 1);
      await saveToHistory(question || (selectedFile?.name ?? 'File Upload'), fullResponse, mode);
      toast.success('Done!');
    } catch (error: any) {
      console.error('Assignment Helper error:', error);
      toast.error('Something went wrong.', { description: error.message });
    } finally { setIsAnalyzing(false); }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mytutorme-${mode}-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const modeConfig = getModeConfig(mode);
  const wordCount = question.trim() ? question.trim().split(/\s+/).length : 0;
  const aiCheckData = (mode === 'ai-check' && result) ? safeParseJSON<AICheckResult>(result) : null;
  const qualityData = (mode === 'quality-score' && result) ? safeParseJSON<QualityResult>(result) : null;

  const getNextSteps = (): NextStep[] => {
    const aiScore = aiCheckData?.totalScore;
    switch (mode) {
      case 'breakdown': return [
        { id: 'expand', label: 'Expand into Essay', icon: AlignLeft, primary: true, action: () => switchModeWithContext('expand', result ?? undefined) },
        { id: 'citations', label: 'Add Citations', icon: BookMarked, action: () => switchModeWithContext('citations') },
        { id: 'nova', label: 'Study with Nova', icon: Bot, action: () => navigate(`${base}/ai-tutor`) },
      ];
      case 'expand': return [
        { id: 'ai-check', label: 'Check AI Content', icon: ScanSearch, primary: true, action: () => switchModeWithContext('ai-check', result ?? undefined) },
        { id: 'citations', label: 'Add Citations', icon: BookMarked, action: () => switchModeWithContext('citations', result ?? undefined) },
        { id: 'quality', label: 'Quality Check', icon: Target, action: () => switchModeWithContext('quality-score', result ?? undefined) },
      ];
      case 'humanize': return [
        { id: 'ai-check', label: 'Re-check AI Score', icon: ScanSearch, primary: true, action: () => switchModeWithContext('ai-check', result ?? undefined) },
        { id: 'quality', label: 'Quality Check', icon: Target, action: () => switchModeWithContext('quality-score', result ?? undefined) },
        { id: 'nova', label: 'Ask Nova', icon: Bot, action: () => navigate(`${base}/ai-tutor`) },
      ];
      case 'citations': return [
        { id: 'quality', label: 'Quality Check Draft', icon: Target, primary: true, action: () => switchModeWithContext('quality-score') },
        { id: 'nova', label: 'Ask Nova to Help Write', icon: Bot, action: () => navigate(`${base}/ai-tutor`) },
      ];
      case 'summarize': return [
        { id: 'eli5', label: "Explain Like I'm 5", icon: Lightbulb, primary: true, action: () => switchModeWithContext('eli5', question) },
        { id: 'nova', label: 'Ask Nova More', icon: Bot, action: () => navigate(`${base}/ai-tutor`) },
        { id: 'courses', label: 'Find a Course', icon: BookOpen, action: () => navigate(`${base}/courses`) },
      ];
      case 'eli5': return [
        { id: 'exam', label: 'Quiz Yourself', icon: GraduationCap, primary: true, action: () => navigate(`${base}/exam-prep`) },
        { id: 'nova', label: 'Ask Nova More', icon: Bot, action: () => navigate(`${base}/ai-tutor`) },
        ...(!isSecondary ? [{ id: 'gpa', label: 'Track GPA Impact', icon: TrendingUp, action: () => navigate('/student/gpa') }] : []),
      ];
      case 'quality-score': return [
        { id: 'humanize', label: 'Fix with Humanizer', icon: Wand2, primary: true, action: () => switchModeWithContext('humanize', question) },
        { id: 'ai-check', label: 'Check AI Content', icon: ScanSearch, action: () => switchModeWithContext('ai-check', question) },
        { id: 'exam', label: 'Practice Exam Questions', icon: GraduationCap, action: () => navigate(`${base}/exam-prep`) },
      ];
      case 'ai-check': {
        const steps: NextStep[] = [];
        if (aiScore === undefined || aiScore > 50)
          steps.push({ id: 'humanize', label: 'Fix with Humanizer', icon: Wand2, primary: true, urgent: (aiScore ?? 0) > 60, action: () => switchModeWithContext('humanize', question) });
        steps.push({ id: 'quality', label: 'Check Quality Score', icon: Target, action: () => switchModeWithContext('quality-score') });
        steps.push({ id: 'nova', label: 'Ask Nova', icon: Bot, action: () => navigate(`${base}/ai-tutor`) });
        return steps;
      }
      default: return [{ id: 'nova', label: 'Ask Nova', icon: Bot, action: () => navigate(`${base}/ai-tutor`) }];
    }
  };

  // â”€â”€â”€ Render helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const renderAICheckResult = (data: AICheckResult) => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <CircularGauge score={data.totalScore} />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <DimensionBar label="Pattern Fingerprinting" score={data.patternScore} />
          <DimensionBar label="Structural Uniformity" score={data.structureScore} />
          <DimensionBar label="Vocabulary & Voice" score={data.vocabularyScore} />
          <DimensionBar label="Rhythm & Burstiness" score={data.burstnessScore} />
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <BarChart2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">Analysis</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${data.confidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : data.confidence === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}>
              {data.confidence} confidence
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{data.analysis}</p>
        </div>
      </div>
      {data.flaggedPhrases.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Flagged Phrases</h4>
          <div className="flex flex-wrap gap-2">
            {data.flaggedPhrases.map((p, i) => (
              <span key={i} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800 px-2 py-1 rounded-lg">"{p}"</span>
            ))}
          </div>
        </div>
      )}
      {data.suggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Suggestions</h4>
          <ul className="flex flex-col gap-2">
            {data.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        AI estimate based on linguistic pattern analysis. Not a certified detection tool — results are indicative only.
      </div>
    </div>
  );

  const renderQualityResult = (data: QualityResult) => (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Overall Grade</p>
          <p className="text-4xl font-bold text-primary">{data.grade}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.overallScore}<span className="text-lg font-normal text-gray-400">/10</span></span>
          <span className="text-xs text-gray-500">Overall Score</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label="Clarity" score={data.clarityScore} icon={Lightbulb} />
        <ScoreCard label="Grammar" score={data.grammarScore} icon={FileEdit} />
        <ScoreCard label="Argument" score={data.argumentScore} icon={Target} />
        <ScoreCard label="Referencing" score={data.referencingScore} icon={BookMarked} />
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{data.summary}</p>
      </div>
      {data.strengths.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">âœ“ Strengths</h4>
          <ul className="flex flex-col gap-1.5">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.improvements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">âš¡ To Improve</h4>
          <ul className="flex flex-col gap-1.5">
            {data.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />{imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderNextSteps = () => {
    const steps = getNextSteps();
    if (!steps.length) return null;
    const showUrgentBanner = mode === 'ai-check' && aiCheckData && aiCheckData.totalScore > 60;
    return (
      <div className="mt-6 flex flex-col gap-3">
        {showUrgentBanner && (
          <div className="flex items-center justify-between gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              High AI content detected. Humanize before submitting.
            </div>
            <button onClick={() => switchModeWithContext('humanize', question)} className="shrink-0 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              Fix Now â†’
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500 self-center shrink-0 hidden sm:block">What's next?</span>
          <div className="flex flex-wrap gap-2">
            {steps.map(step => (
              <button key={step.id} onClick={step.action} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${step.primary ? 'bg-primary text-white hover:bg-primary/90 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:text-primary dark:hover:text-primary'}`}>
                <step.icon className="w-3.5 h-3.5" />{step.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // â”€â”€â”€ JSX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="flex-grow flex flex-col w-full gap-6 relative">

      {/* History drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistoryDrawer(false)} />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> History
              </h2>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
                <button onClick={() => setShowHistoryDrawer(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                  <History className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No history yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map(item => {
                    const cfg = getModeConfig(item.mode);
                    return (
                      <div key={item.id} onClick={() => loadFromHistory(item)} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/40 cursor-pointer bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/60 transition-all group">
                        <div className="flex items-center gap-2 mb-1.5">
                          <cfg.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-xs font-medium text-primary">{cfg.label}</span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">{item.question || 'Uploaded document'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{item.date}</span>
                          <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Load <ChevronRight className="w-3 h-3" /></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Free plan banner */}
      {!hasAccess && (
        <FreePlanUsageCard currentUsage={Math.min(usageCount, 3)} maxLimit={3} description="Free Plan: 3 assignments per month." usageLabel="assignments" variant="default" />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Assignment Helper</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">8 AI tools to help you write, research, and polish your work.</p>
        </div>
        <button onClick={() => setShowHistoryDrawer(true)} className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <History className="w-4 h-4" />
          History
          {history.length > 0 && <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{history.length}</span>}
        </button>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex lg:hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 gap-1">
        {(['input', 'output'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {tab === 'input' ? 'Input' : 'Results'}
            {tab === 'output' && result && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle" />}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 gap-4">

        {/* â•â•â• Input Panel â•â•â• */}
        <div className={`flex flex-col gap-4 ${activeTab === 'output' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="h-0.5 w-full bg-gradient-to-r from-primary via-violet-400 to-green-400 rounded-t-2xl" />
            <div className="p-5 flex flex-col gap-4 flex-grow">

              {/* Mode dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(o => !o)} className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 hover:border-primary/50 transition-colors text-sm font-medium text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <modeConfig.icon className="w-4 h-4 text-primary" />
                    {modeConfig.label}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-y-auto max-h-[480px] scrollbar-hide">
                    {MODE_GROUPS.map(group => (
                      <div key={group.group}>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/30">{group.group}</p>
                        {group.items.map(item => (
                          <button key={item.key} onClick={() => { setMode(item.key); setDropdownOpen(false); }} className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${mode === item.key ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                            <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${mode === item.key ? 'text-primary' : 'text-gray-400'}`} />
                            <div>
                              <p className={`text-sm font-medium ${mode === item.key ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>{item.label}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">{item.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Humanizer level picker */}
              {mode === 'humanize' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">Level:</span>
                  <div className="flex gap-1">
                    {(['subtle', 'moderate', 'strong'] as HumanizeLevel[]).map(lvl => (
                      <button key={lvl} onClick={() => setHumanizeLevel(lvl)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${humanizeLevel === lvl ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject/course field */}
              {showSubjectField && (
                <input type="text" placeholder="Subject or course code (e.g. CSC 301, GST 101)" value={subjectContext} onChange={e => setSubjectContext(e.target.value)} className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors" />
              )}

              {/* Crunch mode banner */}
              {crunchMode && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Crunch mode â€” I have</span>
                  <input type="number" min={1} max={24} value={crunchHours} onChange={e => setCrunchHours(Number(e.target.value))} className="w-14 text-center text-xs font-bold bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-600 rounded-md px-1 py-0.5 text-amber-800 dark:text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">hour(s) left</span>
                  <button onClick={() => setCrunchMode(false)} className="ml-auto text-amber-400 hover:text-amber-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* File attachment indicator */}
              {selectedFile && (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl py-2 px-3">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} disabled={isAnalyzing} className="text-slate-400 hover:text-red-500 transition-colors ml-2 shrink-0"><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* Textarea */}
              <textarea ref={textareaRef} value={question} onChange={e => setQuestion(e.target.value)} disabled={isAnalyzing} placeholder={getPlaceholder(mode)} className="w-full bg-gray-50 dark:bg-slate-800/50 border-0 rounded-xl p-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary/50 resize-none text-sm leading-relaxed outline-none transition-colors min-h-[160px]" style={{ overflow: 'hidden' }} />

              {/* Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1">
                  <button title="Insert equation" className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Sigma className="w-4 h-4" /></button>
                  <button title="Attach file" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Paperclip className="w-4 h-4" /></button>
                  <button title={showSubjectField ? 'Hide subject field' : 'Add subject/course context'} onClick={() => setShowSubjectField(s => !s)} className={`p-2 rounded-lg transition-colors ${showSubjectField ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'}`}><BookOpen className="w-4 h-4" /></button>
                  <button title="Crunch mode" onClick={() => setCrunchMode(c => !c)} className={`p-2 rounded-lg transition-colors ${crunchMode ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}><Zap className="w-4 h-4" /></button>
                  {question.length > 0 && <span className="text-xs text-gray-400 ml-1 tabular-nums">{wordCount}w &middot; {question.length}c</span>}
                </div>
                <div className="flex items-center gap-2">
                  {(question || selectedFile) && !isAnalyzing && (
                    <button onClick={() => { setQuestion(''); setSelectedFile(null); setResult(null); }} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2">Clear</button>
                  )}
                  <button onClick={handleAnalyze} disabled={isAnalyzing || (!question.trim() && !selectedFile)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md">
                    {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />{getSubmitLabel(mode, true)}</> : <>{getSubmitLabel(mode, false)}<Send className="w-3.5 h-3.5" /></>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
        </div>

        {/* â•â•â• Output Panel â•â•â• */}
        <div className={`flex flex-col ${activeTab === 'input' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/30">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <modeConfig.icon className="w-4 h-4 text-primary" />
                {modeConfig.label} â€” Output
              </h2>
              {result && (
                <div className="flex items-center gap-1">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                  <button onClick={handleDownload} title="Download as .txt" className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="flex-grow p-5 overflow-y-auto min-h-[300px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mode === 'ai-check' ? 'Analyzing for AI patterns...' : mode === 'humanize' ? 'Humanizing your text...' : mode === 'quality-score' ? 'Scoring your work...' : 'Processing...'}
                  </p>
                  <p className="text-xs text-gray-400">This usually takes a few seconds.</p>
                </div>
              ) : result ? (
                <div className="flex flex-col gap-2 pb-4">
                  {mode === 'ai-check' && aiCheckData
                    ? renderAICheckResult(aiCheckData)
                    : mode === 'quality-score' && qualityData
                    ? renderQualityResult(qualityData)
                    : (
                      <div className="prose dark:prose-invert prose-slate prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{result}</ReactMarkdown>
                      </div>
                    )
                  }
                  {renderNextSteps()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3 opacity-50">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <modeConfig.icon className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No output yet</p>
                  <p className="text-xs text-gray-400 max-w-[220px]">Select a mode and enter your text to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
