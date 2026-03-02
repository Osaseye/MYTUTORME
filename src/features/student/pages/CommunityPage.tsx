import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Filter, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Hash,
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Community / Forums Page
 * A space for students to ask questions, share notes, and discuss course material.
 * This aligns with the "Community Space" concept discussed.
 */

// Mock Data
const TOPICS = [
  {
    id: 1,
    title: "Help with Calculus Integration by Parts",
    author: "Sarah J.",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+J&background=random",
    category: "Mathematics",
    color: "bg-blue-100 text-blue-700",
    likes: 24,
    comments: 12,
    timeAgo: "2 hours ago",
    preview: "I'm stuck on this specific problem regarding e^x * sin(x). Can someone explain the repeating integration part?",
    isPinned: true
  },
  {
    id: 2,
    title: "Best resources for Python Data Structures?",
    author: "Mike T.",
    authorAvatar: "https://ui-avatars.com/api/?name=Mike+T&background=random",
    category: "Computer Science",
    color: "bg-purple-100 text-purple-700",
    likes: 45,
    comments: 8,
    timeAgo: "5 hours ago",
    preview: "Looking for supplementary videos or articles for linked lists and trees. The course video is great but I need more practice.",
    isPinned: false
  },
  {
    id: 3,
    title: "Physics Lab: Error Analysis Question",
    author: "Davina R.",
    authorAvatar: "https://ui-avatars.com/api/?name=Davina+R&background=random",
    category: "Physics",
    color: "bg-orange-100 text-orange-700",
    likes: 12,
    comments: 3,
    timeAgo: "1 day ago",
    preview: "How do we calculate the percentage error if we don't have the theoretical value given in the manual?",
    isPinned: false
  },
  {
    id: 4,
    title: "Exam Prep Group for Friday?",
    author: "Alex K.",
    authorAvatar: "https://ui-avatars.com/api/?name=Alex+K&background=random",
    category: "General",
    color: "bg-slate-100 text-slate-700",
    likes: 8,
    comments: 15,
    timeAgo: "2 days ago",
    preview: "Anyone want to do a quick review session for the thermodynamics module? Maybe Thursday evening?",
    isPinned: false
  }
];

const CATEGORIES = [
  { name: "All Topics", count: 124, active: true },
  { name: "Mathematics", count: 45, active: false },
  { name: "Computer Science", count: 32, active: false },
  { name: "Physics", count: 18, active: false },
  { name: "Economics", count: 12, active: false },
  { name: "General", count: 17, active: false },
];

export const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('latest');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Community Forum</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Connect with peers, discuss topics, and learn together.</p>
        </div>
        <Button 
            className="bg-primary hover:bg-green-700 text-white gap-2 shadow-lg shadow-primary/20"
            onClick={() => toast.success("New Discussion Started", { description: "Your post has been published to the community." })}
        >
          <Plus className="w-4 h-4" /> Start Discussion
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Navigation & Filters */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search topics..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  />
              </div>

              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                    <button 
                        key={cat.name}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            cat.active 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span>{cat.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.active ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {cat.count}
                        </span>
                    </button>
                ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
              <p className="text-sm text-indigo-100 mb-4">Solve the "Fibonacci Sequence Optimization" problem and win a badge!</p>
              <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none">
                 Join Challenge
              </Button>
           </div>
        </div>

        {/* Main Content: Discussion Feed */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Feed Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
                {['Latest', 'Top', 'Unanswered', 'My Posts'].map((tab) => {
                    const id = tab.toLowerCase();
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id} 
                            onClick={() => setActiveTab(id)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                isActive 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {TOPICS.map((topic) => (
                    <div key={topic.id} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${topic.color}`}>
                                    {topic.category}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    {topic.timeAgo}
                                </span>
                                {topic.isPinned && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                        Pinned
                                    </span>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {topic.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-2">
                            {topic.preview}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <img src={topic.authorAvatar} alt={topic.author} className="w-6 h-6 rounded-full" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{topic.author}</span>
                            </div>

                            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{topic.likes}</span>
                                </button>
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{topic.comments} Comment{topic.comments !== 1 ? 's' : ''}</span>
                                </button>
                                <button className="hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-4">
                 <Button variant="outline" className="text-slate-500">Load More Topics</Button>
            </div>
        </div>

      </div>
    </div>
  );
};
