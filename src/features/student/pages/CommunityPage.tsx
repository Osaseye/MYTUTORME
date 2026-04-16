// @ts-nocheck
import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  X,
  MessageCircle,
  User,
  Clock,
  ArrowLeft,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { useTourStore, TourStep } from '@/app/stores/useTourStore';

/**
 * Community / Forums Page
 * A space for students to ask questions, share notes, and discuss course material.
 */

interface Discussion {
  id: string;
  title: string;
  category: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  repliesCount: number;
}

interface Reply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

export const CommunityPage = () => {
  const { user } = useAuth();
  const { startTour } = useTourStore();
  const [activeTab, setActiveTab] = useState('latest');
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [isCreating, setIsCreating] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  
  const [topics, setTopics] = useState<Discussion[]>([]); 
  const [replies, setReplies] = useState<Reply[]>([]);
  
  const [newTopic, setNewTopic] = useState({ title: '', category: '', content: '' });
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Fetch discussions real-time
  useEffect(() => {
    const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTopics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Discussion[];
      setTopics(fetchedTopics);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching discussions:", error);
      toast.error("Failed to load discussions");
      setIsLoading(false);
    });

    const timer = setTimeout(() => {
      const steps: TourStep[] = [
        {
          title: "Community Forums",
          content: "Welcome to the Community! Here you can ask questions, share resources, and connect with other students.",
          placement: "center"
        },
        {
          targetId: "create-post-btn",
          title: "Start a Discussion",
          content: "Click here to create a new post or ask a question.",
          placement: "left"
        },
        {
          targetId: "category-filters",
          title: "Filter by Subject",
          content: "Use these filters to easily find topics related to specific courses or subjects.",
          placement: "bottom"
        }
      ];
      startTour('community_page_v1', steps);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [startTour]);

  // Fetch replies real-time when a discussion is active
  useEffect(() => {
    if (!activeDiscussion) return;
    setIsLoadingReplies(true);

    const q = query(
      collection(db, 'discussions', activeDiscussion.id, 'replies'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reply[];
      setReplies(fetchedReplies);
      setIsLoadingReplies(false);
    }, (error) => {
      console.error("Error fetching replies:", error);
      toast.error("Failed to load replies");
      setIsLoadingReplies(false);
    });

    return () => unsubscribe();
  }, [activeDiscussion?.id]);

  // Compute dynamic categories
  const dynamicCategories = ['All Topics', ...Array.from(new Set(topics.map(t => t.category).filter(Boolean)))];

  const filteredTopics = topics.filter(t => 
    (activeCategory === 'All Topics' || t.category === activeCategory) &&
    (activeTab !== 'my posts' || t.authorId === user?.uid)
  );

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title || !newTopic.category || !newTopic.content) {
        toast.error("Please fill in all fields.");
        return;
    }
    
    try {
      await addDoc(collection(db, 'discussions'), {
        title: newTopic.title,
        category: newTopic.category,
        content: newTopic.content,
        authorId: user?.uid,
        authorName: user?.displayName || (user as any)?.username || "Student",
        createdAt: serverTimestamp(),
        repliesCount: 0
      });

      toast.success("Discussion Created", { description: "Your post has been published to the community." });
      setIsCreating(false);
      setNewTopic({ title: '', category: '', content: '' });
    } catch (error: any) {
      console.error("Failed to create discussion:", error);
      toast.error("Failed to publish discussion.");
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !activeDiscussion) return;

    try {
      const discussionRef = doc(db, 'discussions', activeDiscussion.id);
      const repliesRef = collection(discussionRef, 'replies');

      // Add reply
      await addDoc(repliesRef, {
        content: newReply,
        authorId: user?.uid,
        authorName: user?.displayName || (user as any)?.username || "Student",
        createdAt: serverTimestamp()
      });

      // Increment count on discussion doc
      await updateDoc(discussionRef, {
        repliesCount: increment(1)
      });

      setNewReply('');
    } catch (error) {
      console.error("Failed to post reply:", error);
      toast.error("Failed to post your reply");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">Community Forum</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">Connect with peers, discuss topics, and learn together.</p>
        </div>
        {!isCreating && !activeDiscussion && (
          <Button 
              data-tour-target="create-post-btn"
              className="bg-primary hover:bg-green-700 text-white gap-2 shadow-lg shadow-primary/20 w-full md:w-auto"
              onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" /> Start Discussion
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
        
        {/* Left Sidebar: Navigation & Filters */}
        <div data-tour-target="category-filters" className={`lg:col-span-1 space-y-6 ${activeDiscussion || isCreating ? 'hidden lg:block' : 'block'}`}>
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
                {dynamicCategories.map((catName) => (
                    <button 
                        key={catName}
                        onClick={() => setActiveCategory(catName)}
                        className={`w-full flex text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeCategory === catName 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span>{catName}</span>
                    </button>
                ))}
              </div>
           </div>

        </div>

        {/* Main Content: Discussion Feed */}
        <div className="lg:col-span-3 space-y-6">
            
            {activeDiscussion ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button 
                       onClick={() => setActiveDiscussion(null)}
                       className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                       <ArrowLeft className="w-4 h-4 mr-1" /> Back to Discussions
                    </button>

                    {/* Original Post */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">{activeDiscussion.authorName}</h4>
                                    <span className="text-xs text-slate-500 block truncate">{activeDiscussion.category}</span>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">
                                {activeDiscussion.createdAt?.toDate ? activeDiscussion.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 break-words">{activeDiscussion.title}</h2>
                        <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {activeDiscussion.content}
                        </div>
                    </div>

                    {/* Replies Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                           <MessageCircle className="w-5 h-5 text-primary" /> 
                           Replies ({replies.length})
                        </h3>

                        {isLoadingReplies ? (
                           <div className="text-center py-6 text-slate-500">Loading replies...</div>
                        ) : replies.length === 0 ? (
                           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                               <p className="text-slate-500">No replies yet. Be the first to help out!</p>
                           </div>
                        ) : (
                           <div className="space-y-4">
                               {replies.map(reply => (
                                   <div key={reply.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                          <User className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-baseline mb-1">
                                              <span className="font-medium text-sm text-slate-900 dark:text-white">{reply.authorName}</span>
                                              <span className="text-xs text-slate-400">
                                                  {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                              </span>
                                          </div>
                                          <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                                      </div>
                                   </div>
                               ))}
                           </div>
                        )}
                    </div>

                    {/* Add Reply Input */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm sticky bottom-4 z-10">
                        <form onSubmit={handlePostReply} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input 
                                type="text"
                                placeholder="Type your reply..."
                                className="w-full sm:flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                            />
                            <Button type="submit" disabled={!newReply.trim()} className="w-full sm:w-auto bg-primary hover:bg-green-700 text-white shrink-0 justify-center">
                                <Send className="w-4 h-4 mr-2" /> Post
                            </Button>
                        </form>
                    </div>

                </div>
            ) : isCreating ? (
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
                            <input 
                                type="text"
                                placeholder="e.g. Mathematics, Physics, General..."
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newTopic.category}
                                onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                            />
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
                {isLoading ? (
                    <div className="py-12 text-center text-slate-500">Loading discussions...</div>
                ) : filteredTopics.length === 0 ? (
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
                ) : (
                    filteredTopics.map((topic) => (
                        <div 
                           key={topic.id} 
                           onClick={() => setActiveDiscussion(topic)}
                           className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {topic.category}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> 
                                    {topic.createdAt?.toDate ? topic.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{topic.content}</p>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-medium">{topic.authorName}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                                        <MessageCircle className="w-4 h-4" /> {topic.repliesCount || 0} Replies
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {filteredTopics.length > 0 && !isLoading && (
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
