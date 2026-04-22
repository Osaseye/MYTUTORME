import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

export const OnboardingLayout = () => {
    return (
        <div className="min-h-screen bg-[#efe4d7] dark:bg-slate-950 flex flex-col relative overflow-hidden">
             {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#11182733_1px,transparent_1px)] [background-size:26px_26px] opacity-30 dark:opacity-10"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[340px] w-[340px] rounded-full bg-primary/25 opacity-30 blur-[110px]"></div>
             </div>

            {/* Minimal Header */}
            <header className="h-16 border-b border-black/5 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm fixed top-0 w-full z-10">
                <div className="container h-full mx-auto px-4 flex items-center justify-between relative z-20">
                    <Link to="/" className="flex items-center gap-2">
                        {/* Placeholder Logo if icon.png is missing */}
                        <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8" />
                        <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                            MyTutor<span className="text-primary">Me</span>
                        </span>
                    </Link>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/95 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        Setup Profile
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center relative z-10 w-full">
                <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
