import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-[#0F172A]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stat counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <StatCounter value={1000} suffix="+" label="Active Students" icon="school" start={visible} />
          <StatCounter value={120} suffix="+" label="Courses Available" icon="menu_book" start={visible} />
          <StatCounter value={0} suffix="" label="Nova — 24/7 AI Tutor" icon="" novaImg start={visible} />
          <StatCounter value={4} suffix="" label="Exams Supported" sublabel="JAMB · WAEC · NECO · POST-UTME" icon="verified" start={visible} />
        </div>
      </div>
    </section>
  );
};

const StatCounter = ({ value, suffix, label, sublabel, icon, novaImg, start }: { value: number; suffix: string; label: string; sublabel?: string; icon: string; novaImg?: boolean; start: boolean }) => {
  const count = useCountUp(value, 1800, start);
  const display = value >= 1000 ? (count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count.toString()) : count.toString();
  return (
    <div className="group flex flex-col items-center text-center p-8 glass-card rounded-[2rem] hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2">
      <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 overflow-hidden">
        {novaImg
          ? <img src="/nova.png" alt="Nova" className="w-full h-full object-cover" />
          : <span className="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400">{icon}</span>
        }
      </div>
      {novaImg ? (
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Always On</p>
      ) : (
        <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value === 0 ? '' : display}{suffix}
        </p>
      )}
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{sublabel}</p>}
    </div>
  );
};
