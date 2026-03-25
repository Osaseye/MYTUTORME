import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const StudyPlannerViewPage = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
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

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!planDoc) return null;

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
                    <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Overall Progress</div>
                            <div className="font-bold text-slate-900 dark:text-white">{planDoc.progress || 0}%</div>
                        </div>
                    </div>
                </div>

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