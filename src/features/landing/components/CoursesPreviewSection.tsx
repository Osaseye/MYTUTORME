import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PreviewCourse {
  id: string;
  title: string;
  description?: string;
  teacherName?: string;
  category?: string;
  price: number | 'Free';
  thumbnailUrl?: string;
  thumbnail?: string;
  rating?: number;
  enrollmentCount?: number;
}

// Titles to prioritise from the catalogue
const TARGET_TITLES = [
  'Modelling and Simulation',
  'Modelling & Simulation',
  'Microprocessor Systems and Applications',
  'Microprocessor Systems & Applications',
  'Cloud Computing',
];

export const CoursesPreviewSection = () => {
  const [courses, setCourses] = useState<PreviewCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch published courses — prefer the 3 target titles, fall back to any 3
        const snap = await getDocs(
          query(collection(db, 'courses'), where('status', '==', 'published'), limit(20))
        );
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PreviewCourse[];

        // Try to match target titles first
        const targeted = TARGET_TITLES.reduce<PreviewCourse[]>((acc, t) => {
          const found = all.find(
            (c) => c.title?.toLowerCase().includes(t.toLowerCase().split(' ')[0])
              && !acc.find((a) => a.id === c.id)
          );
          if (found) acc.push(found);
          return acc;
        }, []);

        const picks = targeted.length >= 3
          ? targeted.slice(0, 3)
          : [...targeted, ...all.filter((c) => !targeted.find((t) => t.id === c.id))].slice(0, 3);

        setCourses(picks);
      } catch (e) {
        console.error('CoursesPreviewSection: fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row justify-between items-end mb-4">
          <div>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Course Library</p>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              From the curriculum. Taught by academics.
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Revenue from every course purchase goes directly to the teaching lecturer.
            </p>
          </div>
          <Link
            to="/student/courses"
            className="hidden md:inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors mt-4 md:mt-0 group text-sm"
          >
            Browse all courses
            <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform text-base">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="mb-10 flex items-center gap-3 w-full sm:w-auto sm:inline-flex px-4 py-3 sm:py-2 rounded-2xl sm:rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400">
          <span className="material-symbols-outlined text-xl sm:text-base shrink-0">local_offer</span>
          <span className="text-sm font-semibold leading-snug">
            Pro members get{' '}
            <strong className="text-emerald-600 dark:text-emerald-300">20% off</strong>{' '}
            every course purchase
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse h-80" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">menu_book</span>
            <p className="font-medium">Courses coming soon.</p>
          </div>
        )}

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            to="/student/courses"
            className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors group text-sm"
          >
            Browse all courses
            <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform text-base">
              arrow_forward
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
};

const CourseCard = ({ course }: { course: PreviewCourse }) => {
  const img = course.thumbnailUrl || course.thumbnail;
  const price = typeof course.price === 'number' ? course.price : 0;
  const proPrice = price > 0 ? Math.round(price * 0.8) : 0;
  const fmt = (n: number) => `₦${n.toLocaleString('en-NG')}`;
  const rating = course.rating ?? 4.7;

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col group hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="h-44 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden relative">
        {img ? (
          <img
            src={img}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-6xl">menu_book</span>
          </div>
        )}
        {course.category && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {course.category}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`material-symbols-outlined text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
            >
              star
            </span>
          ))}
          <span className="text-xs font-bold text-slate-500 ml-1">{rating.toFixed(1)}</span>
          {course.enrollmentCount ? (
            <span className="text-xs text-slate-400 ml-1">({course.enrollmentCount})</span>
          ) : null}
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 leading-tight">{course.title}</h3>
        {course.teacherName && (
          <p className="text-xs text-slate-400 mb-3">by {course.teacherName}</p>
        )}
        {course.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {course.price === 'Free' || price === 0 ? 'Free' : fmt(price)}
          </span>
          {proPrice > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <span className="material-symbols-outlined text-xs">local_offer</span>
              Pro: {fmt(proPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
