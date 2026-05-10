import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, GraduationCap, ArrowRight, Sparkles, Clock, FileText, ListChecks } from 'lucide-react';
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

    const isAdminGeneratedCourse = (courseData: any) => {
        const hasExamSections = Array.isArray(courseData?.mockExam?.sections) && courseData.mockExam.sections.length > 0;
        const hasStudyMaterial = !!courseData?.studyMaterial || !!courseData?.mockExam?.studyMaterial;
        return !!courseData?.generatedCourse || hasExamSections || hasStudyMaterial;
    };

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
                    if (refSnap.exists()) setReferrer(refSnap.data());
                }
            } catch (error) {
                console.error('Error loading invite data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInviteData();
    }, [courseId, referrerId]);

    useEffect(() => {
        if (!course) return;
        const title = course.title || course.mockExam?.title || course.subject || 'Course';
        const inviter = referrer?.displayName ? referrer.displayName.split(' ')[0] : 'A student';
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
        const destination = isAdminGeneratedCourse(course)
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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-medium">Loading invite...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 font-display">Invite Expired or Invalid</h1>
                <p className="text-slate-400 max-w-md mb-8 text-sm">We couldn't find the course you were invited to. It may have been removed or the link is incorrect.</p>
                <Button onClick={() => navigate('/')} className="rounded-full px-8">Return Home</Button>
            </div>
        );
    }

    const displayTitle = course.title || course.mockExam?.title || course.subject || 'Course';
    const inviterName = referrer?.displayName || 'A student';
    const inviterFirstName = inviterName.split(' ')[0];
    const isGenerated = isAdminGeneratedCourse(course);
    const coverImage = course.thumbnailUrl || course.thumbnail || course.image || null;
    const courseDescription = course.description || course.mockExam?.studyMaterial?.title || null;
    const sectionCount = course.mockExam?.sections?.length ?? 0;
    const questionCount = course.mockExam?.sections?.reduce(
        (acc: number, s: any) => acc + (s.questions?.length ?? 0), 0
    ) ?? 0;
    const timeAllowed = course.mockExam?.timeAllowed ?? course.timeAllowed ?? null;
    const hasStats = sectionCount > 0 || questionCount > 0 || timeAllowed;

    return (
        <div className="min-h-screen bg-[#080d14] relative overflow-hidden flex flex-col items-center justify-center px-4 py-12">

            {/* ── Blurred background derived from cover image ── */}
            {coverImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-[0.12] pointer-events-none"
                    style={{ backgroundImage: `url(${coverImage})` }}
                />
            )}

            {/* Ambient radial glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[350px] h-[250px] bg-emerald-600/6 rounded-full blur-[100px]" />
            </div>

            {/* ── Logo bar ── */}
            <div className="relative z-10 flex items-center gap-2 mb-8">
                <img src="/icon.png" alt="MyTutorMe" className="w-7 h-7" />
                <span className="font-display font-bold text-white text-sm tracking-wide">MyTutorMe</span>
            </div>

            {/* ── Main card ── */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="rounded-3xl overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/[0.07] shadow-2xl shadow-black/70">

                    {/* ── Cover image hero ── */}
                    <div className="relative w-full aspect-[16/7] overflow-hidden bg-slate-800">
                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt={displayTitle}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/40 via-slate-800 to-slate-900">
                                <BookOpen className="w-16 h-16 text-emerald-500/30" />
                            </div>
                        )}
                        {/* Strong bottom fade so text below reads cleanly */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                        {/* AI badge */}
                        {isGenerated && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                                <Sparkles className="w-3 h-3" />
                                AI Learning Pack
                            </div>
                        )}
                    </div>

                    {/* ── Body ── */}
                    <div className="px-6 pt-5 pb-7 space-y-5">

                        {/* Course title */}
                        <div>
                            <h1 className="text-xl md:text-2xl font-display font-bold text-white leading-snug line-clamp-2">
                                {displayTitle}
                            </h1>
                            {courseDescription && (
                                <p className="mt-1.5 text-[13px] text-slate-400 line-clamp-2 leading-relaxed">
                                    {courseDescription}
                                </p>
                            )}
                        </div>

                        {/* ── Stats grid ── */}
                        {hasStats && (
                            <div className="grid grid-cols-3 gap-2">
                                {sectionCount > 0 && (
                                    <div className="flex flex-col items-center gap-1 bg-slate-800/60 border border-white/[0.06] rounded-2xl py-3 px-2">
                                        <ListChecks className="w-4 h-4 text-emerald-400" />
                                        <span className="text-white font-bold text-base leading-none">{sectionCount}</span>
                                        <span className="text-slate-500 text-[10px] font-medium">Sections</span>
                                    </div>
                                )}
                                {questionCount > 0 && (
                                    <div className="flex flex-col items-center gap-1 bg-slate-800/60 border border-white/[0.06] rounded-2xl py-3 px-2">
                                        <FileText className="w-4 h-4 text-emerald-400" />
                                        <span className="text-white font-bold text-base leading-none">{questionCount}</span>
                                        <span className="text-slate-500 text-[10px] font-medium">Questions</span>
                                    </div>
                                )}
                                {timeAllowed && (
                                    <div className="flex flex-col items-center gap-1 bg-slate-800/60 border border-white/[0.06] rounded-2xl py-3 px-2">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        <span className="text-white font-bold text-base leading-none">{timeAllowed}</span>
                                        <span className="text-slate-500 text-[10px] font-medium">Minutes</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Inviter callout ── */}
                        <div className="flex items-center gap-3 bg-slate-800/50 border border-white/[0.06] rounded-2xl px-4 py-3">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                                    {referrer?.photoURL ? (
                                        <img src={referrer.photoURL} alt={inviterFirstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <GraduationCap className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                    <Sparkles className="w-2 h-2 text-white" />
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] text-slate-500 font-medium">Personal invite from</p>
                                <p className="text-sm font-semibold text-white truncate">{inviterName}</p>
                            </div>
                            <div className="ml-auto shrink-0 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
                                Free Access
                            </div>
                        </div>

                        {/* ── CTA ── */}
                        <Button
                            size="lg"
                            onClick={handleAcceptInvite}
                            className="w-full h-[52px] rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white text-[15px] shadow-lg shadow-emerald-500/20 group transition-all"
                        >
                            {user ? 'Open Course' : `Accept Invite & Start Learning`}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        {!user && (
                            <p className="text-[11px] text-slate-500 text-center -mt-1">
                                You'll be asked to sign in or create a free account.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer note */}
                <div className="mt-5 flex items-center justify-center gap-2 text-slate-600 text-xs">
                    <img src="/icon.png" alt="" className="w-4 h-4 opacity-40" />
                    <span>Powered by <span className="text-slate-500 font-semibold">MyTutorMe</span></span>
                </div>
            </div>
        </div>
    );
};