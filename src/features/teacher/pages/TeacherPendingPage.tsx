// @ts-nocheck
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LogOut, Clock, XCircle, ShieldAlert, BookOpen } from "lucide-react";


export function TeacherPendingPage() {
  const { user, signOut: logout } = useAuth();
  const navigate = useNavigate();

  // Handle case where user isn't defined
  if (!user || user.role !== "teacher") {
    navigate("/");
    return null;
  }

  // Cast user safely since we verified role
  const verificationStatus = (user as any).verificationStatus || "pending";
  const rejectionReason = (user as any).rejectionReason;

  const isRejected = verificationStatus === "rejected";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      {/* Minimal Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm fixed top-0 w-full z-10">
          <div className="container h-full mx-auto px-4 flex items-center justify-between relative z-20">
              <Link to="/" className="flex items-center gap-2">
                  <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8" onError={(e) => { e.currentTarget.style.display='none' }} />
                  <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <span>MyTutor<span className="text-primary">Me</span></span>
                  </span>
              </Link>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Account Status
              </div>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center relative z-10 w-full">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mt-2 mb-4 bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm">
                {isRejected ? (
                  <XCircle className="h-10 w-10 text-red-500" />
                ) : (
                  <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
                )}
              </div>
              <CardTitle className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                {isRejected ? "Application Rejected" : "Application Under Review"}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-base mt-2">
                {isRejected 
                  ? "We're sorry, but we cannot approve your application to tutor on the platform at this time." 
                  : "Thank you for joining MyTutorMe! Our team is currently reviewing your credentials."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              {isRejected ? (
                <div className="space-y-4">
                  {rejectionReason && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Reason for rejection
                      </h4>
                      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                        {rejectionReason}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    If you believe this is a mistake or wish to appeal this decision, please reach out to our support team and provide any additional context or updated documentations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                      What happens next?
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-amber-700/90 dark:text-amber-300/90">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                        <span>Admin review usually takes 1-2 business days.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                        <span>We will verify your educational background and expertise.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                        <span>Once approved, you'll get full access to the Teacher Dashboard to create courses.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              {isRejected && (
                <Button className="w-full" asChild>
                  <a href="mailto:support@mytutorme.com">Contact Support</a>
                </Button>
              )}
              <Button
                onClick={() => logout()}
                variant={isRejected ? "outline" : "default"}
                className={`w-full flex items-center justify-center gap-2 ${!isRejected && "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"}`}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

