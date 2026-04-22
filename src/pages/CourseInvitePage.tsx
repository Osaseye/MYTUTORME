import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/app/routes/paths';

export const CourseInvitePage = () => {
    const { courseId } = useParams();
    const [searchParams] = useSearchParams();
    const referrerId = searchParams.get('ref');
    
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState<any>(null);
    const [referrer, setReferrer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInviteData = async () => {
            if (!courseId) return;
            try {
                const courseSnap = await getDoc(doc(db, 'courses', courseId));
                if (courseSnap.exists()) {
                    setCourse({ id: courseSnap.id, ...courseSnap.data() });
                }

                if (referrerId) {
                    const refSnap = await getDoc(doc(db, 'users', referrerId));
                    if (refSnap.exists()) {
                        setReferrer(refSnap.data());
                    }
                }
            } catch (error) {
                console.error("Error loading invite data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInviteData();
    }, [courseId, referrerId]);

    // Handle Metadata Update for OG Links
    useEffect(() => {
        if (!course) return;
        const title = course.title || course.mockExam?.title || course.subject || 'Course';
        const inviter = referrer?.username || (referrer?.displayName ? referrer.displayName.split(' ')[0] : 'A student');
        const displayString = `${inviter} invites you to learn ${title} on MyTutorMe`;
        document.title = displayString;
        
        let metaTitle = document.querySelector('meta[property="og:title"]');
        if (!metaTitle) {
            metaTitle = document.createElement('meta');
            metaTitle.setAttribute('property', 'og:title');
            document.head.appendChild(metaTitle);
        }
        metaTitle.setAttribute('content', displayString);
    }, [course, referrer]);

    const handleAcceptInvite = () => {
        const destination = course?.generatedCourse 
            ? `/student/courses/generated/${courseId}`
            : `/student/courses/${courseId}`;

        if (user) {
            navigate(destination);
        } else {
            navigate(`${paths.auth.login}?returnTo=${encodeURIComponent(destination)}`);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading invite...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Invite Expired or Invalid</h1>
                <p className="text-slate-500 max-w-md mb-8 text-sm md:text-base">We couldn't find the course you were invited to. It may have been removed or the link is incorrect.</p>
                <Button onClick={() => navigate('/')} className="rounded-full px-8">Return Home</Button>
            </div>
        );
    }

    const displayTitle = course.title || course.mockExam?.title || course.subject || 'Course';
    const inviterName = referrer?.username || (referrer?.displayName ? referrer.displayName.split(' ')[0] : 'A student');
    const isGenerated = course.generatedCourse;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
            </div>

            {/* Invite Card */}
            <div className="w-full max-w-[420px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-6 md:p-8 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 mx-auto relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
                    <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-white dark:border-slate-700 flex items-center justify-center overflow-hidden z-10">
                        {referrer?.photoURL ? (
                            <img src={referrer.photoURL} alt={inviterName} className="w-full h-full object-cover" />
                        ) : (
                            <GraduationCap className="w-9 h-9 text-primary" />
                        )}
                    </div>
                </div>

                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-0 rounded-full px-3">
                    Course Invitation
                </Badge>

                <h1 className="text-2xl md:text-[28px] font-display font-bold text-slate-900 dark:text-white leading-tight mb-3">
                    <span className="text-primary">{inviterName}</span> invites you to learn on MyTutorMe.
                </h1>

                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 mb-8 border border-slate-100 dark:border-slate-800 mt-6 shadow-inner text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            {isGenerated && <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Admin Learning Pack</p>}
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{displayTitle}</h3>
                        </div>
                    </div>
                </div>

                <Button 
                    size="lg" 
                    onClick={handleAcceptInvite}
                    className="w-full h-14 rounded-2xl font-bold bg-primary text-white hover:bg-primary/95 text-lg shadow-primary/30 shadow-lg group transition-all"
                >
                    {user ? 'View Course' : 'Accept Invite'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                {!user && (
                    <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                        New to MyTutorMe? <span className="font-medium text-slate-700 dark:text-slate-300">You'll be asked to create an account first.</span>
                    </p>
                )}
            </div>
            
            {/* Branding Footer */}
            <div className="mt-10 opacity-60 flex items-center justify-center gap-2">
                <img src="/icon.png" alt="Logo" className="w-5 h-5 opacity-70" />
                <span className="font-display font-bold text-slate-500 text-sm tracking-wide">MyTutorMe</span>
            </div>
        </div>
    );
};