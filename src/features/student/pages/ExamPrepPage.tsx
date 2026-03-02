import { 
  BarChart, 
  Calendar, 
  Clock, 
  BookOpen, 
  BrainCircuit, 
  Play, 
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

import { Link } from 'react-router-dom';

const MOCK_EXAMS = [
  {
    id: 'exam-1',
    title: 'Calculus I - Midterm Simulation',
    difficulty: 'Medium',
    questions: 25,
    duration: 90, // mins
    attempts: 0,
    status: 'Ready',
    topic: 'Derivatives & Limits'
  },
  {
    id: 'exam-2',
    title: 'Linear Algebra Final Prep',
    difficulty: 'Hard',
    questions: 40,
    duration: 120, // mins
    attempts: 1,
    lastScore: 78,
    status: 'Review Needed',
    topic: 'Matrices & Vectors'
  },
  {
    id: 'exam-3',
    title: 'Physics Mechanics Quiz',
    difficulty: 'Easy',
    questions: 15,
    duration: 30, // mins
    attempts: 2,
    lastScore: 92,
    status: 'Mastered',
    topic: 'Kinematics'
  }
];

const MOCK_DECKS = [
  { id: 'deck-1', title: 'Common Derivatives', count: 45, mastery: 80, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'deck-2', title: 'Integration Rules', count: 30, mastery: 45, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'deck-3', title: 'Physics Formulas', count: 60, mastery: 15, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' }
];

export const ExamPrepPage = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'flashcards' | 'planner'>('exams');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Exam Prep Center</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Master your subjects with targeted practice and AI-driven study plans.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary font-medium text-sm">
              <BrainCircuit className="w-4 h-4" />
              <span>AI Study Streak: 5 Days 🔥</span>
           </div>
           <Link to="/student/exam-prep/config">
             <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Study Session
             </Button>
           </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Study Time</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">12h 45m</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Questions Solved</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">842</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Avg. Score</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">78%</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Focus Area</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title="Integral Calculus">Integrals</h3>
           </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Main) */}
        <div className="flex-1 space-y-6">
           
           {/* Navigation Tabs */}
           <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
              <button 
                onClick={() => setActiveTab('exams')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'exams' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Mock Exams
              </button>
              <button 
                onClick={() => setActiveTab('flashcards')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'flashcards' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Flashcards
              </button>
              <button 
                onClick={() => setActiveTab('planner')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'planner' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Study Planner
              </button>
           </div>

           {/* Content Area */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] p-6">
              
              {activeTab === 'exams' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">Recommended Practice Exams</h3>
                      <button className="text-sm text-primary font-medium hover:underline">View All History</button>
                   </div>
                   
                   {MOCK_EXAMS.map((exam) => (
                      <div key={exam.id} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all">
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-3">
                               <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <FileText className="w-5 h-5" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{exam.title}</h4>
                                  <p className="text-sm text-slate-500">{exam.topic} • {exam.questions} Questions</p>
                               </div>
                            </div>
                            <Badge variant={exam.difficulty === 'Hard' ? 'destructive' : exam.difficulty === 'Medium' ? 'default' : 'secondary'}>
                               {exam.difficulty}
                            </Badge>
                         </div>
                         
                         <div className="flex items-center justify-between mt-4 pl-13">
                            <div className="flex gap-4 text-sm text-slate-500">
                               <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration}m</span>
                               {exam.lastScore && (
                                 <span className={`flex items-center gap-1 font-medium ${exam.lastScore >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                    <TrendingUp className="w-4 h-4" /> Last: {exam.lastScore}%
                                 </span>
                               )}
                            </div>
                            <Button size="sm" variant={exam.status === 'Review Needed' ? 'outline' : 'default'}>
                               {exam.status === 'Review Needed' ? 'Review Mistakes' : 'Start Exam'}
                            </Button>
                         </div>
                      </div>
                   ))}
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {MOCK_DECKS.map((deck) => (
                      <div key={deck.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden group">
                         <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 ${deck.color} blur-xl group-hover:scale-150 transition-transform`}></div>
                         
                         <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 relative z-10">{deck.title}</h4>
                         <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 relative z-10">
                            <BookOpen className="w-4 h-4" />
                            <span>{deck.count} Cards</span>
                         </div>
                         
                         <div className="space-y-2 relative z-10">
                            <div className="flex justify-between text-xs font-medium">
                               <span className="text-slate-500">Mastery</span>
                               <span className={deck.mastery > 70 ? 'text-green-600' : 'text-orange-600'}>{deck.mastery}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full ${deck.mastery > 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${deck.mastery}%` }}></div>
                            </div>
                         </div>
                      </div>
                   ))}
                   
                   <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer min-h-[160px]">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                         <Plus className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium text-slate-600 dark:text-slate-400">Create New Deck</h4>
                      <p className="text-xs text-slate-400 mt-1">From notes or AI generation</p>
                   </div>
                </div>
              )}

              {activeTab === 'planner' && (
                <div className="text-center py-12">
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      <Calendar className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Study Planner</h3>
                   <p className="text-slate-500 max-w-md mx-auto mb-8">
                      Tell us your exam date and topics, and we'll generate a personalized day-by-day study schedule for you.
                   </p>
                   <Button className="bg-primary hover:bg-primary/90">
                      Generate New Plan
                   </Button> 
                </div>
              )}

           </div>
        </div>

        {/* Right Sidebar (Quick Actions & Schedule) */}
        <div className="w-full lg:w-80 space-y-6">
           
           {/* Upcoming Widget */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Upcoming Exams</h3>
              <div className="space-y-4">
                 <div className="flex gap-3 items-start">
                    <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg p-2 min-w-[50px]">
                       <span className="text-xs font-bold uppercase">Mar</span>
                       <span className="text-xl font-bold">15</span>
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-slate-900 dark:text-white">Calculus Midterm</h4>
                       <p className="text-xs text-slate-500">10:00 AM • Room 302</p>
                       <p className="text-xs font-medium text-red-500 mt-1">12 Days Left</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 items-start">
                    <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg p-2 min-w-[50px]">
                       <span className="text-xs font-bold uppercase">Apr</span>
                       <span className="text-xl font-bold">02</span>
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-slate-900 dark:text-white">Physics Final</h4>
                       <p className="text-xs text-slate-500">2:00 PM • Main Hall</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Tools */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-yellow-400" /> 
                 Fast Review
              </h3>
              <div className="space-y-2">
                 <button className="w-fulltext-left flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                    <span>Daily Mix</span>
                    <Play className="w-4 h-4 opacity-70" />
                 </button>
                 <button className="w-full text-left flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                    <span>Weakest Topics</span>
                    <BarChart className="w-4 h-4 opacity-70" />
                 </button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
