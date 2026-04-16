import { Button } from "@/components/ui/button";
import { Search, Mail, MoreVertical, Filter, BrainCircuit, Lock, ExternalLink, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const StudentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPremium = user?.teacherSubscriptionPlan === "premium_tools";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, "enrollments"), where("teacherId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const enrollment = docSnap.data();
          let studentData: any = {};
          let courseData: any = {};
          
          if (enrollment.studentId) {
            const studentSnap = await getDoc(doc(db, "users", enrollment.studentId));
            if (studentSnap.exists()) studentData = studentSnap.data();
          } else if (enrollment.userId) {
            const studentSnap = await getDoc(doc(db, "users", enrollment.userId));
            if (studentSnap.exists()) studentData = studentSnap.data();
          }

          if (enrollment.courseId) {
            const courseSnap = await getDoc(doc(db, "courses", enrollment.courseId));
            if (courseSnap.exists()) courseData = courseSnap.data();
          }

          return { 
            id: docSnap.id, 
            ...enrollment,
            name: studentData.name || studentData.displayName || "Unknown Student",
            email: studentData.email || "No email",
            course: courseData.title || courseData.name || "Unknown Course",
            progress: enrollment.progress || 0,
            joined: enrollment.createdAt ? new Date(enrollment.createdAt.toMillis ? enrollment.createdAt.toMillis() : enrollment.createdAt).toLocaleDateString() : "Just now"
          };
        }));
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  const handleExportRoster = () => {
    if (!students || students.length === 0) {
      toast.info("No students to export");
      return;
    }
    const headers = ["Name", "Email", "Course", "Progress", "Joined"];
    const csvContent = [
      headers.join(","),
      ...students.map(s => `"${s.name || ''}","${s.email || ''}","${s.course || ''}",${s.progress || 0},"${s.joined || ''}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "roster.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Students
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Manage and track students enrolled in your courses.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 focus:ring-primary" onClick={() => toast.info("Messaging system coming soon!")}>
              <Mail className="h-4 w-4" /> Message All
            </Button>
            <Button className="bg-primary hover:bg-green-700 text-white shadow-md shadow-primary/20" onClick={handleExportRoster} disabled={loading}>
              Export Roster
            </Button>
          </div>
        </div>

        {/* Premium Conditional Block: AI At-Risk Predictor */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden shadow-sm">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  AI At-Risk Predictor 
                  {!isPremium && <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> Premium</span>}
                </h3>
                <p className="text-sm text-slate-500">Flags students falling behind based on quiz scores and activity.</p>
              </div>
           </div>

           {!isPremium ? (
              <div className="relative">
                 {/* Blurred out content */}
                 <div className="flex gap-4 blur-[6px] opacity-60 pointer-events-none select-none">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8"><AvatarFallback>MO</AvatarFallback></Avatar>
                          <div className="font-medium">Michael O.</div>
                       </div>
                       <p className="text-sm text-rose-500">Hasn`t logged in for 14 days. Quiz avg: 42%</p>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hidden sm:block">
                       <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8"><AvatarFallback>SN</AvatarFallback></Avatar>
                          <div className="font-medium">Sarah N.</div>
                       </div>
                       <p className="text-sm text-rose-500">Failed last 3 modules.</p>
                    </div>
                 </div>
                 {/* Upsell Overlay */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="bg-white/90 dark:bg-slate-900/90 p-5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm max-w-sm">
                       <BrainCircuit className="w-8 h-8 text-primary mx-auto mb-3" />
                       <h4 className="font-bold text-slate-900 dark:text-white mb-2">Unlock Smart Interventions</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Let AI scan your cohort and automatically draft personalized check-in emails to students actively dropping off.</p>
                       <Button onClick={() => navigate("/teacher/dashboard")} className="w-full text-sm font-semibold shadow-md">
                         Upgrade to Premium
                       </Button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                  {students.filter(s => s.status !== "active").map(student => (
                    <div key={`risk-${student.id}`} className="flex-1 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 ring-2 ring-rose-200 dark:ring-rose-800"><AvatarFallback className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">{(student.name || '?').charAt(0)}</AvatarFallback></Avatar>
                            <div className="font-medium text-slate-900 dark:text-slate-200">{student.name || 'Unknown'}</div>
                          </div>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{student.status}</span>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Falling behind the cohort average trajectory.</p>
                       <Button size="sm" variant="outline" className="w-full bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 gap-2">
                          <BrainCircuit className="w-4 h-4" /> Auto-Draft Intervention
                       </Button>
                    </div>
                  ))}
              </div>
           )}
        </div>

        {/* Global Roster Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
             <div className="relative w-full md:w-96 mb-2 md:mb-0">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search students by name..." className="pl-9 bg-white dark:bg-slate-900" />
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm" className="gap-2 bg-white dark:bg-slate-900">
                    <Filter className="h-4 w-4" /> Filter Course
                </Button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Enrolled Course</th>
                  <th className="px-6 py-4">Completion</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">Loading students...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No students enrolled yet.</td>
                  </tr>
                ) : students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {(student.name || '?').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{student.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{student.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {student.course}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div className="w-full max-w-[120px] bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                               <div className="bg-primary h-2 rounded-full" style={{ width: `${student.progress || 0}%` }}></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {student.joined}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => {
                             navigator.clipboard.writeText(student.email);
                             toast.success("Email copied to clipboard!");
                          }}>
                            <Mail className="w-4 h-4 mr-2" /> Email Student
                          </DropdownMenuItem>
                          
                          {/* Teaser Dropdown item for Premium Analytics */}
                          <DropdownMenuItem 
                              className={!isPremium ? "text-slate-400 focus:bg-transparent cursor-default" : "cursor-pointer"}
                              onClick={() => {
                                  if (!isPremium) toast.error("Upgrade to Premium to view detailed analytics.");
                                  else toast.success("Analytics opened!");
                              }}
                          >
                            {!isPremium ? <Lock className="w-4 h-4 mr-2 text-amber-500" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                            Detailed Analytics
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50 dark:bg-slate-900">
            <span>Showing <span className="font-semibold text-slate-900 dark:text-white">{students.length > 0 ? 1 : 0}</span> to <span className="font-semibold text-slate-900 dark:text-white">{students.length}</span> of {students.length} students</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled className="bg-white dark:bg-slate-900">Previous</Button>
                <Button variant="outline" size="sm" disabled className="bg-white dark:bg-slate-900">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


