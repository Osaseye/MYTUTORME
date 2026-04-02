import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
    id: string;
    title: string;
    message: string;
    target: string;
    type: string;
    createdAt: any;
    isRead: string[];
}

export const NotificationDropdown = ({ userRole }: { userRole: 'student' | 'teacher' }) => {
    const { user } = useAuth();
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
            // Sort client-side due to where('target', 'in')
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

    const unreadCount = notifications.filter(n => !n.isRead?.includes(user?.uid || '')).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 outline-none">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                            {unreadCount} New
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center p-6 text-slate-500 text-sm">
                            <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => {
                                const isUnread = !n.isRead?.includes(user?.uid || '');
                                return (
                                    <div key={n.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1 transition-colors ${isUnread ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-transparent'}`}>
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{n.title}</span>
                                            {isUnread && (
                                                <button onClick={() => handleMarkAsRead(n.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
                                        <span className="text-[10px] text-slate-400 mt-1">
                                            {n.createdAt?.toMillis ? new Date(n.createdAt.toMillis()).toLocaleString() : 'Just now'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};