import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Brain, 
  Zap, 
  Layers, 
  CheckCircle,
  HelpCircle,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ExamConfigPage = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState([20]);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [mode, setMode] = useState<string>('standard');
  const [timeLimit, setTimeLimit] = useState<boolean>(true);

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: 'Calculator', count: 1250, color: 'bg-blue-100 text-blue-600' },
    { id: 'physics', name: 'Physics', icon: 'Atom', count: 850, color: 'bg-purple-100 text-purple-600' },
    { id: 'chem', name: 'Chemistry', icon: 'Flask', count: 600, color: 'bg-green-100 text-green-600' },
    { id: 'bio', name: 'Biology', icon: 'Dna', count: 920, color: 'bg-red-100 text-red-600' },
  ];

  const modes = [
    { 
      id: 'standard', 
      title: 'Standard Practice', 
      desc: 'Regular mock exam with balanced question types.',
      icon: Layers
    },
    { 
      id: 'weakness', 
      title: 'Weakness Targeting', 
      desc: 'AI-selected questions focusing on your lowest scoring topics.',
      icon: Target
    },
    { 
      id: 'speed', 
      title: 'Speed Challenge', 
      desc: 'Rapid-fire questions to improve your time management.',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Configure Mock Exam</h1>
            <p className="text-slate-600 dark:text-slate-400">Customize your practice session to target specific goals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Subject Selection */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" /> Select Subject
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {subjects.map((sub) => (
                            <div 
                                key={sub.id}
                                onClick={() => setSelectedSubject(sub.id)}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                                    selectedSubject === sub.id 
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sub.color}`}>
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                                    <p className="text-xs text-slate-500">{sub.count} questions available</p>
                                </div>
                                {selectedSubject === sub.id && (
                                    <div className="ml-auto text-primary">
                                        <CheckCircle className="w-5 h-5 fill-current" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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
                                onClick={() => setMode(m.id)}
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
                            <span className="text-slate-500">Subject</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {subjects.find(s => s.id === selectedSubject)?.name || 'Not Selected'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Questions</span>
                            <span className="font-medium text-slate-900 dark:text-white">{questionCount[0]} Questions</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Duration</span>
                            <span className="font-medium text-slate-900 dark:text-white">~{Math.round(questionCount[0] * 1.5)} Mins</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Difficulty</span>
                            <span className="font-medium capitalize text-slate-900 dark:text-white">{difficulty}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Mode</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {modes.find(m => m.id === mode)?.title}
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

                    <Button className="w-full py-6 text-base font-bold shadow-lg shadow-primary/25 group" disabled={!selectedSubject} onClick={() => {
                        toast.success("Exam Session Started", {
                            description: `Good luck with your ${subjects.find(s => s.id === selectedSubject)?.name} exam!`
                        });
                        navigate('/student/exam-prep/active');
                    }}>
                        Start Exam <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                         Results will be saved to your dashboard
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
