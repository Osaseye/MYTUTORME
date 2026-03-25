import { useState, useEffect } from 'react';
import { 
  Check,
  X,
  Download,
  Search,
  Mail,
  Calendar,
  Briefcase,
  Loader2,
  FileCheck2,
  MoreVertical,
  Ban,
  UserCheck
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface PlatformUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  photoURL?: string;
  createdAt: number;
  // Specific teacher fields
  bio?: string;
  subjects?: string[];
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  // Specific student fields
  level?: string;
  institution?: string;
  // Account status
  isSuspended?: boolean;
}

export const UserManagementPage = () => {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'teachers_pending' | 'students'>('teachers_pending');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState<{id: string, title: string}[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    useEffect(() => {
        // Stream all active users down
        const q = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            } as PlatformUser));
            
            setUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to sync user database");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!selectedUser || selectedUser.role !== 'student') {
                setEnrolledCourses([]);
                return;
            }
            
            setLoadingCourses(true);
            try {
                const q = query(collection(db, 'enrollments'), where('studentId', '==', selectedUser.uid));
                const snapshot = await getDocs(q);
                
                const coursesList: {id: string, title: string}[] = [];
                for (const enrollDoc of snapshot.docs) {
                    const data = enrollDoc.data();
                    const courseId = data.courseId;
                    if (courseId) {
                        try {
                            const courseRef = doc(db, 'courses', courseId);
                            const courseSnap = await getDoc(courseRef);
                            if (courseSnap.exists()) {
                                coursesList.push({
                                    id: courseId,
                                    title: courseSnap.data().title || 'Untitled Course'
                                });
                            }
                        } catch (e) {
                            console.error('Error fetching course', e);
                        }
                    }
                }
                setEnrolledCourses(coursesList);
            } catch (err) {
                console.error("Error fetching enrollments", err);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchEnrolledCourses();
    }, [selectedUser]);

    // Handle Local Filtering
    useEffect(() => {
        let result = users;

        // Tab Filtering
        if (tab === 'teachers_pending') {
            result = result.filter(u => u.role === 'teacher' && u.verificationStatus === 'pending');
        } else if (tab === 'students') {
            result = result.filter(u => u.role === 'student');
        }

        // Search Filtering
        if (searchQuery.trim() !== '') {
            const lw = searchQuery.toLowerCase();
            result = result.filter(u => 
                u.displayName?.toLowerCase().includes(lw) || 
                u.email?.toLowerCase().includes(lw)
            );
        }

        setFilteredUsers(result);
        
        // Auto-select first in list if viewing pending teachers
        if (tab === 'teachers_pending' && result.length > 0 && !selectedUser) {
            setSelectedUser(result[0]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, tab, searchQuery]);

    const handleApproveTeacher = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            await updateDoc(doc(db, 'users', selectedUser.uid), {
                verificationStatus: 'approved',
                permissions: ['create_courses']
            });
            toast.success(`${selectedUser.displayName} has been approved to teach!`);
            setSelectedUser(null);
        } catch {
            toast.error("Failed to process approval");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectTeacher = async () => {
        if (!selectedUser) return;
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setActionLoading(true);
        try {
            await updateDoc(doc(db, 'users', selectedUser.uid), {
                verificationStatus: 'rejected',
                rejectionReason: rejectReason
            });
            toast.success(`Application rejected for ${selectedUser.displayName}`);
            setSelectedUser(null);
            setIsRejectModalOpen(false);
            setRejectReason('');
        } catch {
            toast.error("Failed to reject application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspendToggle = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const newSuspendStatus = !selectedUser.isSuspended;
            await updateDoc(doc(db, 'users', selectedUser.uid), {
                isSuspended: newSuspendStatus
            });
            toast.success(`Account has been ${newSuspendStatus ? 'suspended' : 'unsuspended'}.`);
            // Optimistic update locally for immediate UX feedback
            setSelectedUser({ ...selectedUser, isSuspended: newSuspendStatus });
        } catch {
            toast.error(`Failed to ${selectedUser.isSuspended ? 'unsuspend' : 'suspend'} account`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
                        User Operations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage roles, verify teacher credentials, and oversee platform access.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => { setTab('teachers_pending'); setSelectedUser(null); }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'teachers_pending' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Pending Tutors
                        </button>
                        <button 
                            onClick={() => { setTab('students'); setSelectedUser(null); }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'students' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Students
                        </button>
                        <button 
                            onClick={() => { setTab('all'); setSelectedUser(null); }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All Users
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                {/* Right Column: User List Table */}
                <Card className="xl:col-span-2 flex flex-col shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg">Directory</CardTitle>
                                <CardDescription>Found {filteredUsers.length} matching records</CardDescription>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                    type="text" 
                                    placeholder="Search name or email..." 
                                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 font-medium sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="h-10 px-6 font-medium">User Profile</th>
                                        <th className="h-10 px-4 font-medium hidden sm:table-cell">Joined</th>
                                        <th className="h-10 px-4 font-medium">Role Status</th>
                                        <th className="h-10 px-6 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-500">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                                <p>Syncing users...</p>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-16 text-center text-slate-500">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <p className="font-medium text-slate-900 dark:text-slate-200">No users found</p>
                                                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr 
                                                key={user.uid} 
                                                onClick={() => setSelectedUser(user)}
                                                className={`transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 ${selectedUser?.uid === user.uid ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary' : ''}`}
                                            >
                                                <td className="p-4 px-6 flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                                        <AvatarImage src={user.photoURL} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="max-w-[150px] md:max-w-xs truncate">
                                                        <p className="font-medium text-slate-900 dark:text-white truncate">{user.displayName || 'Unnamed User'}</p>
                                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-4 text-slate-500 hidden sm:table-cell">
                                                    {new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 px-4">
                                                    {user.role === 'student' && (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 font-normal">Student</Badge>
                                                    )}
                                                    {user.role === 'admin' && (
                                                        <Badge variant="secondary" className="bg-slate-800 text-white font-normal">System Admin</Badge>
                                                    )}
                                                    {user.role === 'teacher' && user.verificationStatus === 'pending' && (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-normal">Pending Review</Badge>
                                                    )}
                                                    {user.role === 'teacher' && user.verificationStatus === 'approved' && (
                                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-normal">Tutor</Badge>
                                                    )}
                                                    {user.role === 'teacher' && user.verificationStatus === 'rejected' && (
                                                        <Badge variant="secondary" className="bg-red-50 text-red-600 font-normal line-through">Rejected Tutor</Badge>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Left Column: User Profile Detail */}
                <Card className="xl:col-span-1 h-full shadow-sm flex flex-col sticky top-24">
                    {selectedUser ? (
                        <>
                            <CardHeader className="text-center pb-4 bg-slate-50/50 dark:bg-slate-900/20">
                                <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-white dark:border-slate-800 shadow-sm">
                                    <AvatarImage src={selectedUser.photoURL} />
                                    <AvatarFallback className="bg-primary text-white text-xl font-bold">
                                        {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-center gap-1">
                                    <CardTitle>{selectedUser.displayName || 'Unnamed User'}</CardTitle>
                                    {selectedUser.isSuspended && (
                                        <Badge  className="mt-1 mb-1">Suspended</Badge>
                                    )}
                                </div>
                                <CardDescription className="flex items-center justify-center mt-1">
                                    <Mail className="w-3 h-3 mr-1" /> {selectedUser.email}
                                </CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-6 pt-6 flex-1 overflow-y-auto">
                                {/* Details map */}
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">Joined Platform</p>
                                            <p className="text-slate-500">{new Date(selectedUser.createdAt).toLocaleDateString()} ({new Date(selectedUser.createdAt).toLocaleTimeString()})</p>
                                        </div>
                                    </div>

                                    {selectedUser.role === 'student' && (
                                        <>
                                            {selectedUser.level && (
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">Academic Level</p>
                                                        <p className="text-slate-500 capitalize">{selectedUser.level} • {selectedUser.institution || 'No school provided'}</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-start gap-3 mt-4">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                                    <FileCheck2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">Enrolled Courses</p>
                                                    {loadingCourses ? (
                                                        <div className="flex items-center text-slate-500 text-sm mt-1">
                                                            <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                                            Loading courses...
                                                        </div>
                                                    ) : enrolledCourses.length > 0 ? (
                                                        <ul className="mt-2 space-y-2">
                                                            {enrolledCourses.map((course) => (
                                                                <li key={course.id} className="text-sm bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                                                                    {course.title}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-slate-500 text-sm mt-1">No enrolled courses found.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedUser.role === 'teacher' && (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">Teaching Subjects</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {selectedUser.subjects && selectedUser.subjects.length > 0 ? (
                                                            selectedUser.subjects.map((subj, i) => (
                                                                <Badge key={i} variant="secondary" className="text-[10px]">{subj}</Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-500 text-xs">No subjects listed</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedUser.bio && (
                                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-xs uppercase tracking-wider">Tutor Bio</p>
                                                    <p className="text-slate-600 dark:text-slate-400 italic">"{selectedUser.bio}"</p>
                                                </div>
                                            )}

                                            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900 mt-6">
                                                <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-500">
                                                    <FileCheck2 className="w-4 h-4" />
                                                    <span className="font-semibold text-sm">Credentials & Verification</span>
                                                </div>
                                                <p className="text-xs text-amber-700/80 dark:text-amber-600/80 mb-3">
                                                    Teacher has completed onboarding and is waiting for manual review of credentials before publishing courses.
                                                </p>
                                                <Button size="sm" variant="outline" className="w-full bg-white dark:bg-slate-900 border-amber-200">
                                                    <Download className="w-3 h-3 mr-2" /> Download Submitted Docs
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                            
                            <CardFooter className="flex flex-col gap-2 pt-4 pb-6 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                {selectedUser.role === 'teacher' && selectedUser.verificationStatus === 'pending' && (
                                    <div className="w-full flex gap-2">
                                        <Button 
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-all" 
                                            onClick={handleApproveTeacher}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Approve Tutor</>}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                            onClick={() => setIsRejectModalOpen(true)}
                                            disabled={actionLoading}
                                        >
                                            <X className="w-4 h-4 mr-1.5" /> Reject
                                        </Button>
                                    </div>
                                )}
                                
                                {selectedUser.role !== 'admin' && (
                                    <Button 
                                        variant="ghost" 
                                        className={`w-full hover:bg-slate-100 dark:hover:bg-slate-800 mt-1 ${selectedUser.isSuspended ? 'text-amber-600 hover:text-amber-700' : 'text-slate-500 hover:text-red-600'}`}
                                        onClick={handleSuspendToggle}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                                        {selectedUser.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
                                    </Button>
                                )}
                            </CardFooter>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                                <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">Select a User</h3>
                                <p className="text-slate-500 text-sm max-w-[250px] mx-auto">Click on any user from the directory to view their profile, manage roles, or perform security actions.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Reject Modal */}
            {isRejectModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Reject Tutor Application</h3>
                            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting {selectedUser?.displayName}. This will be shown to the tutor.</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full min-h-[100px] p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:ring-2 focus:ring-primary outline-none"
                                placeholder="E.g., Missing required qualifications, ID unclear..."
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="ghost" onClick={() => { setIsRejectModalOpen(false); setRejectReason(''); }}>Cancel</Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleRejectTeacher}
                                disabled={actionLoading || !rejectReason.trim()}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
