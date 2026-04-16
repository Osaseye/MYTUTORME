// @ts-nocheck
import { useState, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  Star,
  Clock,
   
  
  Check,
  PlayCircle,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


interface Course {
  id: string;
  title: string;
  description?: string;
  teacherName: string;
  category?: string;
  subject?: string;
  price: number | 'Free';
  status: string;
  thumbnailUrl?: string;
  rating?: number;
  enrollmentCount?: number;
  totalDurationMinutes?: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  completedModules: string[];
  course?: Course;
}

export const MyCoursesPage = () => {
    const { user } = useAuthStore();
    const startTour = (...args: any[]) => {};
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingEnrollments, setLoadingEnrollments] = useState(true);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Fetch All Published Courses for Explore
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // In production, you might want to paginate or limit this
                const q = query(
                    collection(db, 'courses'), 
                    // where('status', '==', 'published') // or 'live'
                );
                const snapshot = await getDocs(q);
                const fetchedCourses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Course[];
                setCourses(fetchedCourses);
            } catch (err) {
                console.error("Error fetching courses:", err);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    // Fetch Enrollments for current user
    useEffect(() => {
        if (!user) return;
        
        const q = query(collection(db, 'enrollments'), where('studentId', '==', user.uid));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const rawEnrollments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Enrollment[];

            // Attach Course Data to Enrollments
            const enrichedEnrollments = await Promise.all(
                rawEnrollments.map(async (enr) => {
                    const courseDoc = courses.find(c => c.id === enr.courseId);
                    if (courseDoc) {
                        return { ...enr, course: courseDoc };
                    }
                    // Fallback to fetch if not instantly available from explorer cache
                    // This happens if they are enrolled in a hidden/legacy course
                    return enr;
                })
            );

            setEnrollments(enrichedEnrollments);
            setLoadingEnrollments(false);
        });

        return () => unsubscribe();
    }, [user, courses]);

    // Derived filtered courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesLevel = levelFilter === 'All' || ((course as any).level && (course as any).level.toLowerCase() === levelFilter.toLowerCase());
        const matchesSubject = subjectFilter === 'All' || (course.subject && course.subject.toLowerCase() === subjectFilter.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || (course.category && course.category.toLowerCase() === categoryFilter.toLowerCase());

        return matchesSearch && matchesLevel && matchesSubject && matchesCategory;
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            startTour('my-courses-tour', [
                {
                    target: 'course-tabs',
                    title: 'Your Learning Hub',
                    content: 'Switch between browsing the entire course catalog and viewing the courses you have already enrolled in.',
                    placement: 'bottom'
                },
                {
                    target: 'course-filters',
                    title: 'Search & Refine',
                    content: 'Use this bar to search by keyword, level, or category to find exactly what you want to learn.',
                    placement: 'bottom'
                },
                {
                    target: 'course-grid',
                    title: 'Course Catalog',
                    content: 'Click on any course card to view its curriculum, price, and enroll to start your learning journey.',
                    placement: 'top'
                }
            ]);
        }, 1000);
        return () => clearTimeout(timer);
    }, [startTour]);

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="mb-8 md:mb-12">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                    Your Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Hub</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                    Discover new courses or resume where you left off.
                </p>
            </div>

            <Tabs defaultValue="explore" className="w-full">
                <TabsList data-tour-target="course-tabs" className="grid w-full grid-cols-1 sm:grid-cols-2 lg:w-[400px] mb-8 bg-slate-100 dark:bg-slate-800 p-1 h-auto gap-y-1">
                    <TabsTrigger value="explore" className="flex items-center gap-2">
                        <Search className="w-4 h-4" /> Explore Catalog
                    </TabsTrigger>
                    <TabsTrigger value="enrolled" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> My Courses ({enrollments.length})
                    </TabsTrigger>
                </TabsList>

                {/* MY COURSES TAB */}
                <TabsContent value="enrolled" className="mt-0">
                    {loadingEnrollments ? (
                        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                    ) : enrollments.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Not enrolled yet</h3>
                            <p className="text-slate-500 mb-6">You haven't started any courses.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {enrollments.map((enr) => (
                                <Link to={`/student/courses/${enr.courseId}`} key={enr.id}>
                                    <div className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-full">
                                        <div className="h-40 bg-slate-200 dark:bg-slate-800 relative">
                                            {enr.course?.thumbnailUrl ? (
                                                <img src={enr.course.thumbnailUrl} alt={enr.course?.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                                    <span className="text-white/50 font-bold text-xl">MyTutorMe</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <PlayCircle className="w-12 h-12 text-white" />
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-2">
                                                {enr.course?.title || "Loading Course Data..."}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-4">{enr.course?.teacherName || "Instructor"}</p>
                                            
                                            <div className="mt-auto pt-4 space-y-2">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-slate-700 dark:text-slate-300">Progress</span>
                                                    <span className="text-primary">{enr.progress}%</span>
                                                </div>
                                                <Progress value={enr.progress} className="h-2" />
                                                <p className="text-xs text-slate-500 text-right">{enr.completedModules?.length || 0} modules completed</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* EXPLORE CATALOG TAB */}
                <TabsContent value="explore" className="mt-0">
                    {/* Search & Filter Bar */}
                    <div data-tour-target="course-filters" className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-8 sticky top-20 z-30">
                        <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="w-5 h-5 text-slate-400" />
                            </span>
                            <input 
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow" 
                            placeholder="Search for physics, calculus, python..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide max-w-[calc(100vw-2.5rem)] md:max-w-none">
                            <select 
                                value={levelFilter} 
                                onChange={(e) => setLevelFilter(e.target.value)} 
                                className="py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:ring-primary focus:border-primary cursor-pointer min-w-[140px] outline-none"
                            >
                                <option value="All">Level: All</option>
                                <option value="Secondary">Level: Secondary</option>
                                <option value="Tertiary">Level: Tertiary</option>
                            </select>
                            <select 
                                value={subjectFilter} 
                                onChange={(e) => setSubjectFilter(e.target.value)} 
                                className="py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:ring-primary focus:border-primary cursor-pointer min-w-[140px] outline-none"
                            >
                                <option value="All">Subject: All</option>
                                <option value="STEM">Subject: STEM</option>
                                <option value="Arts">Subject: Arts</option>
                                <option value="Business">Subject: Business</option>
                            </select>
                        </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
                            <div>
                                <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-primary" /> Categories
                                </h3>
                                <ul className="space-y-2">
                                {["All", "Mathematics", "Computer Science", "Physics", "Literature"].map((category, idx) => (
                                    <li key={idx}>
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input 
                                            type="radio"
                                            name="category"
                                            value={category}
                                            checked={categoryFilter === category}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${categoryFilter === category ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-800 group-hover:border-primary'}`}>
                                            {categoryFilter === category && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`text-sm transition-colors ${categoryFilter === category ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400 group-hover:text-primary'}`}>{category}</span>
                                    </label>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </aside>

                        {/* Content Grid */}
                        <div data-tour-target="course-grid" className="flex-grow">
                            {loadingCourses ? (
                                <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                            ) : filteredCourses.length === 0 ? (
                                <div className="py-20 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-lg mb-4">No courses found matching your criteria.</p>
                                    <Button variant="outline" onClick={() => { setSearchQuery(''); setLevelFilter('All'); setSubjectFilter('All'); setCategoryFilter('All');}}>Clear Filters</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredCourses.map(course => (
                                        <Link to={`/student/courses/${course.id}`} key={course.id}>
                                            <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                                                <div className="aspect-[16/9] bg-slate-200 relative overflow-hidden">
                                                    {course.thumbnailUrl ? (
                                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-500">
                                                            <BookOpen className="w-10 h-10 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-white/90 text-slate-900 font-bold backdrop-blur-sm shadow-sm hover:bg-white border-0">
                                                            {course.price === 'Free' || course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="p-5 flex flex-col flex-grow">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="text-xs text-slate-500 shadow-sm">{course.subject || course.category || "Subject"}</Badge>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 md:h-14 mb-2">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mb-4">{course.teacherName}</p>
                                                    
                                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                                                        <div className="flex items-center gap-1.5 focus:outline-none">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{course.rating || "4.5"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{course.totalDurationMinutes ? `${Math.round(course.totalDurationMinutes/60)}h` : "Flexible"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
