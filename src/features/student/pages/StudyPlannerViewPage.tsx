// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, CheckCircle2, Circle, Trophy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const StudyPlannerViewPage = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [planDoc, setPlanDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) return;
            try {
                const docRef = doc(db, 'study_plans', planId);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setPlanDoc({ id: snapshot.id, ...snapshot.data() });
                } else {
                    toast.error('Study plan not found.');
                    navigate('/student/exam-prep');
                }
            } catch (err) {
                console.error("Error fetching plan", err);
                toast.error('Failed to load study plan.');
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId, navigate]);

    const toggleTask = async (weekIndex: number, taskIndex: number) => {
        if (!planDoc) return;
        if (!isOwner) {
            toast.info('This is a shared plan. Only the owner can update tasks.');
            return;
        }
        
        // Deep clone to update
        const updatedWeeks = JSON.parse(JSON.stringify(planDoc.planData.weeks));
        const currentStatus = updatedWeeks[weekIndex].tasks[taskIndex].completed;
        updatedWeeks[weekIndex].tasks[taskIndex].completed = !currentStatus;

        // Calculate overarching progress
        let total = 0;
        let completed = 0;
        updatedWeeks.forEach((w: any) => {
            w.tasks.forEach((t: any) => {
                total++;
                if (t.completed) completed++;
            });
        });

        const progress = Math.round((completed / total) * 100);
        
        const newPlanDoc = {
            ...planDoc,
            progress,
            planData: {
                ...planDoc.planData,
                weeks: updatedWeeks
            }
        };

        setPlanDoc(newPlanDoc);

        try {
            await updateDoc(doc(db, 'study_plans', planId!), {
                progress,
                'planData.weeks': updatedWeeks
            });
        } catch (err) {
            console.error("Failed to save progress", err);
            toast.error("Failed to sync progress.");
        }
    };

    const handleSharePlan = async () => {
        if (!planId || !planDoc) return;
        const shareUrl = `${window.location.origin}/student/exam-prep/planner/${planId}`;

        try {
            if (isOwner && !planDoc.isShared) {
                await updateDoc(doc(db, 'study_plans', planId), {
                    isShared: true,
                    sharedAt: serverTimestamp(),
                });
                setPlanDoc((prev: any) => prev ? { ...prev, isShared: true } : prev);
            }

            if (navigator.share) {
                await navigator.share({
                    title: `${planDoc.subject || 'Study'} Plan`,
                    text: 'Check out this study plan on MyTutorMe',
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Study plan link copied!');
            }
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error('Error sharing study plan', error);
                toast.error('Could not share the study plan right now.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!planDoc) return null;

    const isOwner = user?.uid && planDoc.userId === user.uid;

    

    return (
        <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 w-full min-h-screen py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/student/exam-prep')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                                {planDoc.subject} Prep
                            </h1>
                            <p className="text-sm text-slate-500">{planDoc.targetExam} • {planDoc.durationWeeks} Weeks</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleSharePlan} className="gap-2">
                            <Share2 className="w-4 h-4" /> Share Plan
                        </Button>
                        <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <div>
                                <div className="text-xs text-slate-500 font-medium">Overall Progress</div>
                                <div className="font-bold text-slate-900 dark:text-white">{planDoc.progress || 0}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isOwner && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 px-4 py-3 text-sm">
                        Shared view mode: only the owner can mark tasks complete.
                    </div>
                )}

                {/* Overarching Details */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-slate-800 dark:text-slate-200">
                    <h2 className="font-bold text-lg mb-2 text-primary">{planDoc.planData.title}</h2>
                    <p className="opacity-90">{planDoc.planData.overview}</p>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    {planDoc.planData.weeks.map((week: any, wIdx: number) => (
                        <div key={wIdx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                                    {week.weekNumber}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Week {week.weekNumber}</h3>
                                    <p className="text-sm text-slate-500">{week.focus}</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {week.tasks.map((task: any, tIdx: number) => (
                                    <div 
                                      key={tIdx} 
                                      onClick={() => toggleTask(wIdx, tIdx)}
                                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${task.completed ? 'bg-primary/5 text-slate-500 dark:text-slate-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <div className="mt-0.5">
                                            {task.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                            )}
                                        </div>
                                        <span className={`flex-1 ${task.completed ? 'line-through opacity-70' : ''}`}>
                                            {task.task}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
