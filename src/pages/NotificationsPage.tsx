import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    title: string;
    message: string;
    target: string;
    type: string;
    createdAt: any;
    isRead: string[];
}

export const NotificationsPage = ({ userRole }: { userRole: 'student' | 'teacher' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notifications'), 
            where('target', 'in', ['all', userRole])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
            fetched.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });
            setNotifications(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userRole]);

    const handleMarkAsRead = async (id: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'notifications', id), {
                isRead: arrayUnion(user.uid)
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Notifications</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center p-12 text-slate-500">
                        <Bell className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No notifications yet</h3>
                        <p className="text-sm">We'll let you know when there's something new.</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((n) => {
                            const isUnread = !n.isRead?.includes(user?.uid || '');
                            return (
                                <div key={n.id} className={`p-4 md:p-6 flex flex-col gap-2 transition-colors ${isUnread ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'bg-transparent'}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 ${isUnread ? 'bg-indigo-500' : 'bg-transparent'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                                <span className="text-xs text-slate-400 mt-2 block">
                                                    {n.createdAt?.toMillis ? new Date(n.createdAt.toMillis()).toLocaleString() : 'Just now'}
                                                </span>
                                            </div>
                                        </div>
                                        {isUnread && (
                                            <button 
                                                onClick={() => handleMarkAsRead(n.id)} 
                                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">Mark as read</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
