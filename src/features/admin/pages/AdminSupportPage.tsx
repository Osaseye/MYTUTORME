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
  AlertCircle
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

export const AdminSupportPage = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 -mx-6 -mt-6 p-6 md:px-10 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <MessageCircle className="h-6 w-6 text-indigo-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Support & Announcements</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">View user complaints and broadcast platform announcements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-6 md:px-10">
                
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
        </div>
    );
};