import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Community / Forums Page
 * A space for students to ask questions, share notes, and discuss course material.
 */

const CATEGORIES = [
  { name: "All Topics", active: true },
  { name: "Mathematics", active: false },
  { name: "Computer Science", active: false },
  { name: "Physics", active: false },
  { name: "Economics", active: false },
  { name: "General", active: false },
];

export const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [isCreating, setIsCreating] = useState(false);
  const [topics] = useState([]); // Empty state ready for backend
  const [newTopic, setNewTopic] = useState({ title: '', category: 'General', content: '' });

  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title || !newTopic.content) {
        toast.error("Please fill in all fields.");
        return;
    }
    toast.success("Discussion Created", { description: "Your post has been published to the community." });
    setIsCreating(false);
    setNewTopic({ title: '', category: 'General', content: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Community Forum</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Connect with peers, discuss topics, and learn together.</p>
        </div>
        {!isCreating && (
          <Button 
              className="bg-primary hover:bg-green-700 text-white gap-2 shadow-lg shadow-primary/20"
              onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" /> Start Discussion
          </Button>
        )}
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
                        className={`w-full flex text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            cat.active 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span>{cat.name}</span>
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
            
            {isCreating ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Start a New Discussion</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                            <X className="w-5 h-5 text-slate-500" />
                        </Button>
                    </div>
                    
                    <form onSubmit={handleCreateDiscussion} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                            <input 
                                type="text"
                                placeholder="What's on your mind?"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newTopic.title}
                                onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newTopic.category}
                                onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                            >
                                {CATEGORIES.filter(c => c.name !== 'All Topics').map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                            <textarea 
                                placeholder="Describe your question or topic in detail..."
                                rows={6}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                value={newTopic.content}
                                onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-green-700 text-white">
                                Post Discussion
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
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
                {topics.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No discussions yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Be the first to start a conversation with the community! Ask a question or share something interesting.</p>
                        <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-green-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Start Discussion
                        </Button>
                    </div>
                ) : null}
            </div>

            {topics.length > 0 && (
                <div className="flex justify-center pt-4">
                    <Button variant="outline" className="text-slate-500">Load More Topics</Button>
                </div>
            )}
            </>
            )}
        </div>

      </div>
    </div>
  );
};
