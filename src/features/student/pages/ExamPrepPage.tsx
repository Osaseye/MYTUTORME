import { 
  BarChart, 
  Calendar, 
  Clock, 
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
import { useState } from 'react';

import { Link } from 'react-router-dom';

export const ExamPrepPage = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'flashcards' | 'planner'>('exams');

  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Exam Prep Center</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Master your subjects with targeted practice and AI-driven study plans.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary font-medium text-sm">
              <BrainCircuit className="w-4 h-4" />
              <span>AI Study Streak: 0 Days</span>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">0h 00m</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Questions Solved</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">0</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Avg. Score</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">-</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Focus Area</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title="None">None</h3>
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
                   
                   <div className="text-center py-10">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                         <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Exams Available</h4>
                      <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't been assigned any practice exams yet. Try generating a new study plan or creating a custom mock exam.</p>
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => setActiveTab('planner')}>
                         Create Study Plan
                      </Button>
                   </div>
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   
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
