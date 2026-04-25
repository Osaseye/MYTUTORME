import { useState, useEffect, useRef } from 'react';
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
  Ban,
  UserCheck,
  BrainCircuit,
  Filter,
  ChevronDown,
  GraduationCap,
  Target,
  BookOpen,
  Layers,
  Award,
  TrendingUp,
  Users,
  ArrowLeft,
  Hash,
  Globe
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

// Types

interface PlatformUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  photoURL?: string;
  createdAt: number;
  // Common
  username?: string;
  isSuspended?: boolean;
  isOnboardingComplete?: boolean;
  plan?: string;
  // Student-specific (from onboarding)
  level?: string;
  institution?: string;
  courseOfStudy?: string;
  classLevel?: string;
  gradingSystem?: '4.0' | '5.0';
  currentCGPA?: number;
  targetCGPA?: number;
  painPoint?: string;
  interests?: string[];
  // Teacher-specific (from onboarding)
  headline?: string;
  bio?: string;
  subjects?: string[];
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  teacherSubscriptionPlan?: string;
  lifetimeEarnings?: number;
  currentCommissionRate?: number;
}

interface FilterState {
  plan: string;
  status: string;
  education: string;
  verification: string;
}

const DEFAULT_FILTERS: FilterState = {
  plan: 'all',
  status: 'all',
  education: 'all',
  verification: 'all',
};

// Filter Dropdown

const FilterDropdown = ({
  filters,
  onChange,
  activeTab,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  activeTab: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCount = Object.entries(filters).filter(([, v]) => v !== 'all').length;
  const set = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });
  const reset = () => onChange(DEFAULT_FILTERS);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 px-3"
      >
        <Filter className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-sm">Filter</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center h-4 w-4 bg-primary text-white rounded-full text-[10px] font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Filter Users</p>
            {activeCount > 0 && (
              <button onClick={reset} className="text-xs text-primary hover:underline">Clear all</button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Status</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['all', 'active', 'suspended'] as const).map(v => (
                <button key={v} onClick={() => set('status', v)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-colors ${filters.status === v ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription Plan</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: 'all', label: 'All' },
                { v: 'free_student', label: 'Free Student' },
                { v: 'pro_monthly', label: 'Pro Monthly' },
                { v: 'pro_yearly', label: 'Pro Yearly' },
                { v: 'free_teacher', label: 'Free Teacher' },
                { v: 'premium_teacher', label: 'Premium Teacher' },
              ].map(({ v, label }) => (
                <button key={v} onClick={() => set('plan', v)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filters.plan === v ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {(activeTab === 'students' || activeTab === 'all') && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Education Level</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[{ v: 'all', label: 'All' }, { v: 'secondary', label: 'Secondary' }, { v: 'tertiary', label: 'Tertiary' }].map(({ v, label }) => (
                  <button key={v} onClick={() => set('education', v)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filters.education === v ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'teachers' || activeTab === 'all') && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Teacher Verification</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[{ v: 'all', label: 'All' }, { v: 'pending', label: 'Pending' }, { v: 'approved', label: 'Approved' }, { v: 'rejected', label: 'Rejected' }].map(({ v, label }) => (
                  <button key={v} onClick={() => set('verification', v)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filters.verification === v ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Detail Row helper

const DetailRow = ({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl ${highlight ? 'bg-primary/5 dark:bg-primary/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
    <div className={`p-1.5 rounded-lg shrink-0 ${highlight ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-1">{label}</p>
      <div className="text-sm text-slate-800 dark:text-slate-200 font-medium break-words">
        {value ?? <span className="text-slate-400 font-normal italic">Not provided</span>}
      </div>
    </div>
  </div>
);

// Main Component

export const UserManagementPage = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'teachers_pending' | 'teachers' | 'students'>('teachers_pending');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<{ id: string; title: string }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  const [stats, setStats] = useState({
    aiQueries: 0,
    studyPlans: 0,
    mockExams: 0,
    flashcards: 0,
    createdCourses: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Stream users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as PlatformUser));
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to sync user database');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch per-user data
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!selectedUser || selectedUser.role !== 'student') { setEnrolledCourses([]); return; }
      setLoadingCourses(true);
      try {
        const q = query(collection(db, 'enrollments'), where('studentId', '==', selectedUser.uid));
        const snapshot = await getDocs(q);
        const coursesList: { id: string; title: string }[] = [];
        for (const enrollDoc of snapshot.docs) {
          const data = enrollDoc.data();
          const courseId = data.courseId;
          if (courseId) {
            try {
              const courseSnap = await getDoc(doc(db, 'courses', courseId));
              if (courseSnap.exists()) coursesList.push({ id: courseId, title: courseSnap.data().title || 'Untitled Course' });
            } catch (e) { console.error('Error fetching course', e); }
          }
        }
        setEnrolledCourses(coursesList);
      } catch (err) {
        console.error('Error fetching enrollments', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchUserStats = async () => {
      if (!selectedUser) return;
      setLoadingStats(true);
      try {
        let aiQueries = 0, studyPlans = 0, mockExams = 0, flashcards = 0, createdCourses = 0;
        const aiSnap = await getDocs(query(collection(db, 'ai_sessions'), where('studentId', '==', selectedUser.uid)));
        aiSnap.forEach(d => {
          const data = d.data();
          if (data.messages && Array.isArray(data.messages)) aiQueries += Math.floor(data.messages.length / 2);
        });
        studyPlans = (await getDocs(query(collection(db, 'study_plans'), where('userId', '==', selectedUser.uid)))).size;
        mockExams = (await getDocs(query(collection(db, 'quiz_attempts'), where('studentId', '==', selectedUser.uid)))).size;
        flashcards = (await getDocs(query(collection(db, 'flashcard_decks'), where('userId', '==', selectedUser.uid)))).size;
        if (selectedUser.role === 'teacher' || selectedUser.role === 'admin') {
          createdCourses = (await getDocs(query(collection(db, 'courses'), where('teacherId', '==', selectedUser.uid)))).size;
        }
        setStats({ aiQueries, studyPlans, mockExams, flashcards, createdCourses });
      } catch (err) {
        console.error('Error fetching stats', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchEnrolledCourses();
    fetchUserStats();
  }, [selectedUser]);

  // Filtering
  useEffect(() => {
    let result = users;

    if (tab === 'teachers_pending') result = result.filter(u => u.role === 'teacher' && u.verificationStatus === 'pending');
    else if (tab === 'teachers') result = result.filter(u => u.role === 'teacher' && u.verificationStatus !== 'pending');
    else if (tab === 'students') result = result.filter(u => u.role === 'student');

    if (searchQuery.trim()) {
      const lw = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.displayName?.toLowerCase().includes(lw) ||
        u.email?.toLowerCase().includes(lw) ||
        u.username?.toLowerCase().includes(lw) ||
        u.institution?.toLowerCase().includes(lw) ||
        u.courseOfStudy?.toLowerCase().includes(lw)
      );
    }

    if (filters.status === 'active') result = result.filter(u => !u.isSuspended);
    else if (filters.status === 'suspended') result = result.filter(u => !!u.isSuspended);

    if (filters.plan !== 'all') {
      if (filters.plan === 'free_student')    result = result.filter(u => u.role === 'student' && (!u.plan || u.plan === 'free'));
      if (filters.plan === 'pro_monthly')     result = result.filter(u => u.role === 'student' && (u.plan === 'pro_monthly' || u.plan === 'monthly'));
      if (filters.plan === 'pro_yearly')      result = result.filter(u => u.role === 'student' && (u.plan === 'pro_yearly' || u.plan === 'yearly'));
      if (filters.plan === 'free_teacher')    result = result.filter(u => u.role === 'teacher' && (!u.teacherSubscriptionPlan || u.teacherSubscriptionPlan === 'free'));
      if (filters.plan === 'premium_teacher') result = result.filter(u => u.role === 'teacher' && u.teacherSubscriptionPlan === 'premium_tools');
    }

    if (filters.education !== 'all') result = result.filter(u => u.level === filters.education);
    if (filters.verification !== 'all') result = result.filter(u => u.verificationStatus === filters.verification);

    setFilteredUsers(result);

    if (tab === 'teachers_pending' && result.length > 0 && !selectedUser) setSelectedUser(result[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, tab, searchQuery, filters]);

  // Actions
  const handleApproveTeacher = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), { verificationStatus: 'approved', permissions: ['create_courses'] });
      toast.success(`${selectedUser.displayName} has been approved to teach!`);
      setSelectedUser(null);
      setShowDetailMobile(false);
    } catch { toast.error('Failed to process approval'); }
    finally { setActionLoading(false); }
  };

  const handleRejectTeacher = async () => {
    if (!selectedUser) return;
    if (!rejectReason.trim()) { toast.error('Please provide a reason for rejection'); return; }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), { verificationStatus: 'rejected', rejectionReason: rejectReason });
      toast.success(`Application rejected for ${selectedUser.displayName}`);
      setSelectedUser(null);
      setShowDetailMobile(false);
      setIsRejectModalOpen(false);
      setRejectReason('');
    } catch { toast.error('Failed to reject application'); }
    finally { setActionLoading(false); }
  };

  const handleSuspendToggle = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const newStatus = !selectedUser.isSuspended;
      await updateDoc(doc(db, 'users', selectedUser.uid), { isSuspended: newStatus });
      toast.success(`Account has been ${newStatus ? 'suspended' : 'unsuspended'}.`);
      setSelectedUser({ ...selectedUser, isSuspended: newStatus });
    } catch { toast.error(`Failed to ${selectedUser.isSuspended ? 'unsuspend' : 'suspend'} account`); }
    finally { setActionLoading(false); }
  };

  const getPlanLabel = (u: PlatformUser) => {
    if (u.role === 'teacher') return u.teacherSubscriptionPlan === 'premium_tools' ? 'Premium Teacher' : 'Free Teacher';
    if (!u.plan || u.plan === 'free') return 'Free Student';
    if (u.plan === 'pro_monthly' || u.plan === 'monthly') return 'Pro Monthly';
    if (u.plan === 'pro_yearly' || u.plan === 'yearly') return 'Pro Yearly';
    return u.plan;
  };

  const isPremium = (u: PlatformUser) =>
    (u.role === 'teacher' && u.teacherSubscriptionPlan === 'premium_tools') ||
    (u.role === 'student' && !!u.plan && u.plan !== 'free');

  // Detail Panel
  const renderDetailPanel = () => {
    if (!selectedUser) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
            <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">Select a User</h3>
            <p className="text-slate-500 text-sm max-w-[250px] mx-auto">Click on any user from the directory to view their full profile.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="xl:hidden px-4 pt-4">
          <button onClick={() => setShowDetailMobile(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        </div>

        <CardHeader className="text-center pb-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/0">
          <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-white dark:border-slate-800 shadow-md">
            <AvatarImage src={selectedUser.photoURL} />
            <AvatarFallback className="bg-primary text-white text-xl font-bold">
              {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg">{selectedUser.displayName || 'Unnamed User'}</CardTitle>
            {selectedUser.username && <p className="text-xs text-slate-400 font-mono">@{selectedUser.username}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              <Badge variant="outline" className={`capitalize text-xs ${isPremium(selectedUser) ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {getPlanLabel(selectedUser)}
              </Badge>
              {selectedUser.isSuspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
              {selectedUser.isOnboardingComplete === false && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">Onboarding incomplete</Badge>
              )}
            </div>
          </div>
          <CardDescription className="flex items-center justify-center gap-1 mt-1 text-xs">
            <Mail className="w-3 h-3" /> {selectedUser.email}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-5">

          <section className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Account</p>
            <div className="space-y-1.5">
              <DetailRow icon={Calendar} label="Joined" value={new Date(selectedUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <DetailRow icon={Hash} label="User ID" value={<span className="font-mono text-xs text-slate-500">{selectedUser.uid}</span>} />
              <DetailRow icon={Users} label="Role" value={<span className="capitalize">{selectedUser.role}</span>} highlight />
            </div>
          </section>

          {selectedUser.role === 'student' && (
            <>
              <section className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Academic Profile</p>
                <div className="space-y-1.5">
                  <DetailRow icon={GraduationCap} label="Education Level" value={selectedUser.level ? <span className="capitalize">{selectedUser.level}</span> : undefined} />
                  <DetailRow icon={Globe} label="Institution" value={selectedUser.institution} />
                  {selectedUser.level === 'tertiary' && (
                    <DetailRow icon={BookOpen} label="Course of Study" value={selectedUser.courseOfStudy} />
                  )}
                  <DetailRow icon={Layers} label="Class / Level" value={selectedUser.classLevel} />
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Study Focus</p>
                <div className="space-y-1.5">
                  <DetailRow icon={Target} label="Primary Goal" value={selectedUser.painPoint} />
                  <DetailRow
                    icon={BookOpen}
                    label="Subjects / Interests"
                    value={selectedUser.interests && selectedUser.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedUser.interests.map((s, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    ) : undefined}
                  />
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Enrolled Courses</p>
                {loadingCourses ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm p-3"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</div>
                ) : enrolledCourses.length > 0 ? (
                  <ul className="space-y-1.5">
                    {enrolledCourses.map(c => (
                      <li key={c.id} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-700 dark:text-slate-300">{c.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic px-1">No enrolled courses found.</p>
                )}
              </section>
            </>
          )}

          {selectedUser.role === 'teacher' && (
            <>
              <section className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Info</p>
                <div className="space-y-1.5">
                  <DetailRow icon={Briefcase} label="Headline" value={selectedUser.headline} />
                  <DetailRow
                    icon={BookOpen}
                    label="Subjects Taught"
                    value={selectedUser.subjects && selectedUser.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedUser.subjects.map((s, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    ) : undefined}
                  />
                </div>
              </section>

              {selectedUser.bio && (
                <section className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bio</p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">"{selectedUser.bio}"</p>
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Verification & Plan</p>
                <div className="space-y-1.5">
                  <DetailRow
                    icon={FileCheck2}
                    label="Verification Status"
                    highlight
                    value={
                      <span className={`capitalize font-semibold ${selectedUser.verificationStatus === 'approved' ? 'text-emerald-600' : selectedUser.verificationStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                        {selectedUser.verificationStatus || 'Unknown'}
                      </span>
                    }
                  />
                  {selectedUser.rejectionReason && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900">
                      <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-700 dark:text-red-400">{selectedUser.rejectionReason}</p>
                    </div>
                  )}
                  {selectedUser.currentCommissionRate !== undefined && (
                    <DetailRow icon={TrendingUp} label="Commission Rate" value={`${((selectedUser.currentCommissionRate || 0) * 100).toFixed(0)}%`} />
                  )}
                  {selectedUser.lifetimeEarnings !== undefined && (
                    <DetailRow icon={Award} label="Lifetime Earnings" value={`&#8358;${(selectedUser.lifetimeEarnings || 0).toLocaleString()}`} />
                  )}
                </div>
              </section>

              {selectedUser.verificationStatus === 'pending' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck2 className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-500">Credentials Submitted</span>
                  </div>
                  <p className="text-xs text-amber-700/80 dark:text-amber-600 mb-3">Teacher is awaiting manual review before they can publish courses.</p>
                  <Button size="sm" variant="outline" className="w-full bg-white dark:bg-slate-900 border-amber-200 text-amber-700">
                    <Download className="w-3 h-3 mr-2" /> Download Submitted Docs
                  </Button>
                </div>
              )}
            </>
          )}

          <section className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
              <BrainCircuit className="w-3 h-3 text-primary" /> Platform Usage
            </p>
            {loadingStats ? (
              <div className="flex items-center justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {selectedUser.role === 'student' && (
                  <>
                    {[
                      { label: 'AI Queries', value: stats.aiQueries },
                      { label: 'Study Plans', value: stats.studyPlans },
                      { label: 'Mock Exams', value: stats.mockExams },
                      { label: 'Flashcard Decks', value: stats.flashcards },
                      { label: 'Enrolled Courses', value: enrolledCourses.length },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 mb-1">{label}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </>
                )}
                {(selectedUser.role === 'teacher' || selectedUser.role === 'admin') && (
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">Courses Created</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.createdCourses}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-4 pb-6 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {selectedUser.role === 'teacher' && selectedUser.verificationStatus === 'pending' && (
            <div className="w-full flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleApproveTeacher} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Approve</>}
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200" onClick={() => setIsRejectModalOpen(true)} disabled={actionLoading}>
                <X className="w-4 h-4 mr-1.5" /> Reject
              </Button>
            </div>
          )}
          {selectedUser.role !== 'admin' && (
            <Button
              variant="ghost"
              className={`w-full ${selectedUser.isSuspended ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}
              onClick={handleSuspendToggle}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
              {selectedUser.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
            </Button>
          )}
        </CardFooter>
      </>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage roles, verify tutors, and oversee platform access.</p>
        </div>
        <div className="w-full sm:w-auto overflow-x-auto pb-1">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg min-w-max gap-0.5">
            {([
              { key: 'teachers_pending', label: 'Pending Tutors' },
              { key: 'teachers', label: 'Tutors' },
              { key: 'students', label: 'Students' },
              { key: 'all', label: 'All Users' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSelectedUser(null); setShowDetailMobile(false); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  tab === key
                    ? key === 'teachers_pending'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600'
                      : 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {label}
                {key === 'teachers_pending' && users.filter(u => u.role === 'teacher' && u.verificationStatus === 'pending').length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                    {users.filter(u => u.role === 'teacher' && u.verificationStatus === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:h-[calc(100vh-160px)]">

        <Card className={`xl:col-span-2 flex flex-col shadow-sm ${showDetailMobile ? 'hidden xl:flex' : 'flex'}`}>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Directory</CardTitle>
                <CardDescription className="text-xs">{filteredUsers.length} matching records</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64 sm:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search name, email, institution..."
                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown filters={filters} onChange={setFilters} activeTab={tab} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[520px]">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/60 text-slate-500 font-medium sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                      <th className="h-10 px-4 font-medium">User</th>
                      <th className="h-10 px-3 font-medium hidden sm:table-cell">Joined</th>
                      <th className="h-10 px-3 font-medium">Status</th>
                      <th className="h-10 px-4 text-right font-medium hidden md:table-cell">Plan</th>
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
                        <td colSpan={4} className="p-12 text-center text-slate-500">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">No users found</p>
                          <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.uid}
                          onClick={() => { setSelectedUser(user); setShowDetailMobile(true); }}
                          className={`transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 ${selectedUser?.uid === user.uid ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary' : ''}`}
                        >
                          <td className="p-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shrink-0">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate text-sm leading-tight">{user.displayName || 'Unnamed User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                {user.institution && <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.institution}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 px-3 text-slate-500 text-xs hidden sm:table-cell whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-3 px-3">
                            {user.isSuspended ? (
                              <Badge variant="destructive" className="text-[10px] font-normal">Suspended</Badge>
                            ) : user.role === 'student' ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-normal">Student</Badge>
                            ) : user.role === 'admin' ? (
                              <Badge variant="secondary" className="bg-slate-800 text-white text-[10px] font-normal">Admin</Badge>
                            ) : user.verificationStatus === 'pending' ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] font-normal">Pending</Badge>
                            ) : user.verificationStatus === 'approved' ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] font-normal">Tutor</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-50 text-red-600 text-[10px] font-normal">Rejected</Badge>
                            )}
                          </td>
                          <td className="p-3 px-4 text-right hidden md:table-cell">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isPremium(user) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {getPlanLabel(user)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className={`xl:col-span-1 xl:h-full shadow-sm flex flex-col xl:sticky xl:top-24 ${showDetailMobile || !selectedUser ? 'flex' : 'hidden xl:flex'}`}>
          <ScrollArea className="flex-1 h-full">
            <div className="flex flex-col min-h-full">
              {renderDetailPanel()}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {isRejectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Reject Tutor Application</h3>
              <p className="text-sm text-slate-500 mb-4">Provide a reason for rejecting {selectedUser.displayName}. This will be shown to the tutor.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full min-h-[100px] p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="E.g., Missing required qualifications, ID unclear..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => { setIsRejectModalOpen(false); setRejectReason(''); }}>Cancel</Button>
              <Button onClick={handleRejectTeacher} disabled={actionLoading || !rejectReason.trim()}>
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
