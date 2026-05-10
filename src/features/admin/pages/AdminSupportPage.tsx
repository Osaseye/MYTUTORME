import { useState, useEffect } from 'react';
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  MessageCircle, 
  Send,
  Ticket,
  Mail,
  Clock,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: any;
}

interface FeedbackResponse {
  id: string;
  userType: string;
  usageDuration: string;
  featuresUsed: string[];
  courseRating: number;
  contentRelevant: string;
  contentIssues: string[];
  courseComments: string;
  examRating: number;
  usedAiTutorDuringExam: string;
  aiTutorRating: number;
  examComments: string;
  overallRating: number;
  likedMost: string;
  wouldImprove: string;
  nps: number | null;
  awarenessFeatures: string[];
  otherComments: string;
  submittedAt: any;
}

export const AdminSupportPage = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedbackResponses, setFeedbackResponses] = useState<FeedbackResponse[]>([]);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
    
    // Announcement state
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [announcementTarget, setAnnouncementTarget] = useState<'all' | 'student' | 'teacher'>('all');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
            setTickets(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch tickets:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'feedbackResponses'), orderBy('submittedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackResponse));
            setFeedbackResponses(fetched);
            setFeedbackLoading(false);
        }, (error) => {
            console.error('Failed to fetch feedback:', error);
            setFeedbackLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const markAsClosed = async (id: string, currentStatus: string) => {
      try {
        await updateDoc(doc(db, 'support_tickets', id), {
            status: currentStatus === 'open' ? 'closed' : 'open'
        });
        toast.success(`Ticket marked as ${currentStatus === 'open' ? 'closed' : 'open'}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update ticket status");
      }
    };

    const handleSendAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await addDoc(collection(db, 'notifications'), {
                title: announcementTitle,
                message: announcementMessage,
                target: announcementTarget,
                type: 'announcement',
                isRead: [],
                createdAt: serverTimestamp()
            });
            toast.success("Announcement sent successfully!");
            setAnnouncementTitle('');
            setAnnouncementMessage('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to send announcement");
        } finally {
            setSending(false);
        }
    };

    const formatDate = (val: any) => {
        if (!val) return 'Just now';
        if (val.seconds) return new Date(val.seconds * 1000).toLocaleString();
        if (val.toMillis) return new Date(val.toMillis()).toLocaleString();
        return new Date(val).toLocaleString();
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 -mx-4 -mt-4 md:-mx-6 md:-mt-6 p-4 md:p-6 md:px-10 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <MessageCircle className="h-6 w-6 text-indigo-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Support & Announcements</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">View user complaints and broadcast platform announcements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Tickets Section */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-indigo-500" /> Support Tickets
                            </CardTitle>
                            <CardDescription>Recent complaints and queries from users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-slate-500">Loading tickets...</div>
                            ) : tickets.length === 0 ? (
                                <div className="p-16 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-slate-500">Inbox zero! No support tickets found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {tickets.map(ticket => (
                                        <div key={ticket.id} className={`p-6 transition-colors ${ticket.status === 'closed' ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className={ticket.role === 'teacher' ? 'text-indigo-600 bg-indigo-50' : 'text-emerald-600 bg-emerald-50'}>
                                                        {(ticket.role || 'student').toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {formatDate(ticket.createdAt)}
                                                    </span>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant={ticket.status === 'open' ? 'default' : 'outline'}
                                                    onClick={() => markAsClosed(ticket.id, ticket.status)}
                                                >
                                                    {ticket.status === 'open' ? 'Mark Resolved' : 'Reopen'}
                                                </Button>
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{ticket.subject}</h3>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
                                                {ticket.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Mail className="h-4 w-4" /> 
                                                <span className="font-medium">{ticket.name}</span>
                                                <a href={`mailto:${ticket.email}`} className="text-indigo-600 hover:underline">({ticket.email})</a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Announcement Broadcast Section */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800 sticky top-32">
                        <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Send className="h-5 w-5" /> Broadcast Announcement
                            </CardTitle>
                            <CardDescription className="text-indigo-100">Send a platform-wide notification.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSendAnnouncement} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Audience</label>
                                    <select 
                                        value={announcementTarget}
                                        onChange={(e) => setAnnouncementTarget(e.target.value as any)}
                                        className="flex h-10 w-full rounded-md border border-input bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="student">Students Only</option>
                                        <option value="teacher">Teachers Only</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input 
                                        required
                                        placeholder="e.g. Scheduled Maintenance" 
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <Textarea 
                                        required
                                        rows={5}
                                        placeholder="Enter your announcement message..." 
                                        value={announcementMessage}
                                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 resize-none"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={sending}>
                                    {sending ? 'Broadcasting...' : 'Publish Announcement'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Feedback Responses Section ─────────────────────────────── */}
            <div className="mt-4">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquareText className="h-5 w-5 text-emerald-500" /> User Feedback Responses
                                </CardTitle>
                                <CardDescription>Responses submitted via the /feedback page.</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                                {feedbackResponses.length} total
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {feedbackLoading ? (
                            <div className="p-12 text-center text-slate-500">Loading responses...</div>
                        ) : feedbackResponses.length === 0 ? (
                            <div className="p-16 text-center">
                                <MessageSquareText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No feedback responses yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {feedbackResponses.map((fb) => {
                                    const isOpen = expandedFeedback === fb.id;
                                    const npsColor = fb.nps !== null
                                        ? fb.nps >= 9 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                        : fb.nps >= 7 ? 'text-lime-600 bg-lime-50 dark:bg-lime-900/20'
                                        : 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                        : '';
                                    return (
                                        <div key={fb.id} className="bg-white dark:bg-slate-900">
                                            {/* Summary row */}
                                            <button
                                                type="button"
                                                onClick={() => setExpandedFeedback(isOpen ? null : fb.id)}
                                                className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{fb.userType || '—'}</span>
                                                        <span className="text-xs text-slate-400">{fb.usageDuration || '—'}</span>
                                                        {/* Overall stars */}
                                                        <div className="flex items-center gap-0.5">
                                                            {[1,2,3,4,5].map(s => (
                                                                <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.overallRating ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                                                            ))}
                                                        </div>
                                                        {fb.nps !== null && (
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${npsColor}`}>NPS {fb.nps}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-slate-400">{formatDate(fb.submittedAt)}</span>
                                                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                </div>
                                                {/* Features used pills */}
                                                {fb.featuresUsed?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {fb.featuresUsed.map(f => (
                                                            <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{f.replace(/_/g, ' ')}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>

                                            {/* Expanded detail */}
                                            {isOpen && (
                                                <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
                                                    {/* Ratings */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ratings</h4>
                                                        {[
                                                            { label: 'Course Quality', val: fb.courseRating },
                                                            { label: 'Exam Prep', val: fb.examRating },
                                                            { label: 'AI Tutor', val: fb.aiTutorRating },
                                                            { label: 'Overall', val: fb.overallRating },
                                                        ].map(r => (
                                                            <div key={r.label} className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-600 dark:text-slate-300">{r.label}</span>
                                                                <div className="flex gap-0.5">
                                                                    {[1,2,3,4,5].map(s => (
                                                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.val ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Exam & Tutor */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exam & AI Tutor</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium">AI Tutor used:</span> {fb.usedAiTutorDuringExam || '—'}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium">Content relevance:</span> {fb.contentRelevant || '—'}</p>
                                                        {fb.contentIssues?.length > 0 && (
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Content issues:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {fb.contentIssues.map(i => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">{i}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {fb.awarenessFeatures?.length > 0 && (
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Didn't know about:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {fb.awarenessFeatures.map(f => <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600">{f.replace(/_/g, ' ')}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Open-ended responses */}
                                                    {[
                                                        { label: 'Liked most', val: fb.likedMost },
                                                        { label: 'Would improve', val: fb.wouldImprove },
                                                        { label: 'Course comments', val: fb.courseComments },
                                                        { label: 'Exam comments', val: fb.examComments },
                                                        { label: 'Other', val: fb.otherComments },
                                                    ].filter(f => f.val).map(f => (
                                                        <div key={f.label} className="md:col-span-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{f.label}</p>
                                                            <p className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-3 leading-relaxed">{f.val}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
