/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Eye, Clock, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const CommunityPage = () => {
    const { user } = useAuth();
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replies, setReplies] = useState<Record<string, any[]>>({});

    useEffect(() => {
        const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setDiscussions(list);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!expandedPost) return;
        const q = query(
            collection(db, "discussions", expandedPost, "replies"),
            orderBy("createdAt", "asc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setReplies(prev => ({
                ...prev,
                [expandedPost]: list
            }));
        });
        return () => unsubscribe();
    }, [expandedPost]);

    const handleCreatePost = async () => {
        if (!newTitle.trim() || !newContent.trim() || !user) return;
        try {
            await addDoc(collection(db, "discussions"), {
                title: newTitle,
                content: newContent,
                authorName: user.displayName || 'Teacher',
                authorId: user.uid,
                role: user.role || 'Teacher',
                repliesCount: 0,
                views: 0,
                likes: 0,
                createdAt: serverTimestamp(),
                tag: "General",
                color: "blue"
            });
            setNewTitle("");
            setNewContent("");
            setShowNewPost(false);
            toast.success("Discussion posted!");
        } catch (error: any) {
            toast.error("Failed to post discussion");
        }
    };

    const handleReply = async (discussionId: string) => {
        if (!replyText.trim() || !user) return;
        try {
            await addDoc(collection(db, "discussions", discussionId, "replies"), { 
                content: replyText, 
                authorName: user.displayName || 'Teacher', 
                authorId: user.uid, 
                role: 'Teacher', 
                createdAt: serverTimestamp() 
            });
            const ref = doc(db, "discussions", discussionId);
            await updateDoc(ref, {
                repliesCount: increment(1)
            });
            setReplyText("");
            toast.success("Reply added!");
        } catch (error: any) {
            toast.error("Failed to reply");
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        return 'Recently';
    };

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Community Hub
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Connect with others, share tips, and get help.
            </p>
          </div>
          <Button 
            onClick={() => setShowNewPost(!showNewPost)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-green-700 text-white shadow-lg"
          >
            <MessageSquare className="w-4 h-4" />
            New Discussion
          </Button>
        </div>

        {showNewPost && (
            <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
                <Input 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    placeholder="What's on your mind?" 
                    className="w-full"
                />
                <Textarea 
                    value={newContent} 
                    onChange={e => setNewContent(e.target.value)} 
                    placeholder="Provide more details..." 
                    className="w-full min-h-[100px]"
                />
                <div className="flex justify-end">
                    <Button onClick={handleCreatePost} className="bg-primary hover:bg-green-700 text-white">Post</Button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-4">
                {discussions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        No discussions found. Be the first to start one!
                    </div>
                ) : (
                    discussions.map((discussion) => (
                        <div key={discussion.id} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow group">
                            <div 
                                className="cursor-pointer" 
                                onClick={() => setExpandedPost(expandedPost === discussion.id ? null : discussion.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${discussion.color || 'blue'}-100 text-${discussion.color || 'blue'}-700 dark:bg-${discussion.color || 'blue'}-900/30 dark:text-${discussion.color || 'blue'}-300`}>
                                            {discussion.tag || 'General'}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {formatDate(discussion.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                    {discussion.title}
                                </h3>
                                {discussion.content && (
                                    <p className="text-slate-600 text-sm mt-2">{discussion.content}</p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {(discussion.authorName || discussion.author || '?')[0]}
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{discussion.authorName || discussion.author || 'Anonymous'}</span>
                                        <span className="text-xs text-slate-400">• {discussion.role || 'Member'}</span>
                                    </div>
                                     <div className="flex items-center gap-4 text-slate-400 text-sm">
                                        <span className="flex items-center gap-1 hover:text-primary">
                                            <MessageSquare className="w-4 h-4" /> {discussion.repliesCount || 0}
                                        </span>
                                        <span className="flex items-center gap-1 hover:text-blue-500">
                                            <ThumbsUp className="w-4 h-4" /> {discussion.likes || 0}
                                        </span>
                                         <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" /> {discussion.views || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {expandedPost === discussion.id && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-3 mb-4">
                                        {(replies[discussion.id] || []).map((reply: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex gap-3 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex-shrink-0 flex items-center justify-center font-bold text-xs">
                                                    {(reply.authorName || reply.author || '?')[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200">{reply.authorName || reply.author || 'Anonymous'}</div>
                                                    <div className="text-slate-600 dark:text-slate-400 mt-1">{reply.content || reply.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={expandedPost === discussion.id ? replyText : ""}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="h-9 text-sm"
                                        />
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleReply(discussion.id)}
                                            className="bg-primary hover:bg-green-700 text-white px-3"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Teaching Tips', 'Equipment', 'Marketing', 'Announcements', 'Subject Help', 'Feedback'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                 <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
                    <p className="text-sm text-indigo-200 mb-4">Create a 5-minute promo video for your course.</p>
                    <Button variant="secondary" size="sm" className="w-full text-indigo-900 bg-indigo-50 hover:bg-white text-xs">View Details</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
