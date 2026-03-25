import { Link, Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import loginBg from "@/assets/login.png"; 
import { GlobalLoader } from "@/components/ui/global-loader";

const testimonials = [
  {
    quote: "MyTutorMe helped me jump from a 2.5 to a 4.5 GPA in just one semester. The AI explanations are clearer than my handouts!",
    author: "Chinedu O.",
    role: "Engineering Student at UNILAG"
  },
  {
    quote: "I was struggling with JAMB prep until I found this. The mix of AI help and real past questions is exactly what I needed.",
    author: "Amara N.",
    role: "Aspiring Medical Student"
  },
  {
    quote: "The personalized study plan kept me on track during the strike. I didn't miss a beat when school resumed.",
    author: "Ibrahim Y.",
    role: "Computer Science, ABU Zaria"
  }
];

export const AuthLayout = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <GlobalLoader />;
  }

  // If the user logs in or registers successfully, redirect them away from Auth screens
  if (isAuthenticated && user) {
    if (user.role !== 'admin' && !user.isOnboardingComplete) {
      return <Navigate to={`/onboarding/${user.role === 'teacher' ? 'teacher' : 'student'}`} replace />;
    }
    const dashboardMap = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user.role as keyof typeof dashboardMap] || '/'} replace />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 lg:h-screen lg:overflow-hidden">
      {/* Left Side - Form Area */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-surface-light dark:bg-[#0f172a] py-12 relative lg:overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-[450px] mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-10 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
               <img src="/icon.png" alt="MyTutorMe Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
              MyTutor<span className="text-primary">Me</span>
            </span>
          </Link>

          {/* Form Content (Outlet) */}
          <Outlet />
          
        </div>
      </div>

      {/* Right Side - Visual Area */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-900">
        {/* Background Image */}
        <div className="absolute inset-0">
            <img 
              src={loginBg} 
              alt="Student learning" 
              className="w-full h-full object-cover opacity-60"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-16 text-white">
          <div className="max-w-xl">
             {/* Animated Testimonial */}
             <div className="min-h-[180px]">
                <div key={currentTestimonial} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                    <span className="inline-block p-3 rounded-xl bg-primary/20 backdrop-blur-sm mb-6 text-primary-light border border-primary/20">
                        <span className="material-symbols-outlined text-2xl">format_quote</span>
                    </span>
                    <blockquote className="text-2xl font-display font-medium leading-relaxed mb-6">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-primary/20">
                            {testimonials[currentTestimonial].author.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-lg">{testimonials[currentTestimonial].author}</div>
                            <div className="text-slate-300 text-sm">{testimonials[currentTestimonial].role}</div>
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Indicators */}
             <div className="flex gap-2 mt-8">
                {testimonials.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentTestimonial(idx)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            currentTestimonial === idx ? "w-8 bg-primary" : "w-1.5 bg-slate-500/50 hover:bg-slate-400"
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
