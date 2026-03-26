import { useState, useEffect } from 'react';
import {
  BookOpen,
  Check,
  X,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Flag,
  Filter,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Course {
    id: string;
    title: string;
    description: string;
    teacherId: string;
    teacherName: string;
    teacherPhotoURL?: string;
    price: number | 'Free';
    category: string;
    status: 'draft' | 'pending' | 'pending_review' | 'published' | 'rejected' | 'flagged';
    reports?: number;
    createdAt: number;
    thumbnail?: string;
    rejectionReason?: string;
}

export const CourseModerationPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [tab, setTab] = useState<'pending' | 'live' | 'flagged'>('pending');

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCourses: Course[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                
                let parsedCreatedAt = Date.now();
                if (data.createdAt) {
                    if (typeof data.createdAt === 'number') parsedCreatedAt = data.createdAt;
                    else if (typeof data.createdAt.toMillis === 'function') parsedCreatedAt = data.createdAt.toMillis();
                    else if (data.createdAt.seconds) parsedCreatedAt = data.createdAt.seconds * 1000;
                    else {
                        const dateObj = new Date(data.createdAt);
                        if (!isNaN(dateObj.getTime())) parsedCreatedAt = dateObj.getTime();
                    }
                }

                let cat = data.subject || data.category || 'Uncategorized';
                if (cat.toLowerCase() === 'uncategoruzed') cat = 'Uncategorized';

                fetchedCourses.push({
                    id: doc.id,
                    title: data.title || 'Untitled Course',
                    description: data.description || '',
                    teacherId: data.teacherId,
                    teacherName: data.teacherName || 'Unknown Teacher',
                    teacherPhotoURL: data.teacherPhotoURL,
                    price: data.price || 'Free',
                    category: cat,
                    status: data.status || 'draft',
                    reports: data.reports || 0,
                    createdAt: parsedCreatedAt,
                    thumbnail: data.thumbnail,
                    rejectionReason: data.rejectionReason
                });
            });
            setCourses(fetchedCourses);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching courses:", error);
            toast.error("Failed to load courses");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let result = courses;

        if (tab === 'pending') {
            result = result.filter(c => c.status === 'pending_review' || c.status === 'pending');
        } else if (tab === 'live') {
            result = result.filter(c => c.status === 'published');
        } else if (tab === 'flagged') {
            result = result.filter(c => c.status === 'flagged' || (c.reports && c.reports > 0));
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => 
                c.title.toLowerCase().includes(q) || 
                c.teacherName.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
            );
        }

        setFilteredCourses(result);
    }, [courses, tab, searchQuery]);

    const handleApproveCourse = async (courseId: string) => {
        try {
            await updateDoc(doc(db, 'courses', courseId), {
                status: 'published',
                rejectionReason: null
            });
            toast.success("Course approved and published successfully");
        } catch (error) {
            toast.error("Failed to approve course");
            console.error(error);
        }
    };

    const handleOpenRejectModal = (courseId: string) => {
        setSelectedCourseId(courseId);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectCourse = async () => {
        if (!selectedCourseId) return;
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setActionLoading(true);
        try {
            await updateDoc(doc(db, 'courses', selectedCourseId), {
                status: 'rejected',
                rejectionReason: rejectReason
            });
            toast.success("Course rejected");
            setIsRejectModalOpen(false);
            setSelectedCourseId(null);
        } catch (error) {
            toast.error("Failed to reject course");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFlagCourse = async (courseId: string) => {
        try {
            await updateDoc(doc(db, 'courses', courseId), {
                status: 'flagged'
            });
            toast.success("Course flagged for review");
        } catch (error) {
            toast.error("Failed to flag course");
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">Content Moderation</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review new courses, manage flagged content, and maintain platform quality.</p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full" onValueChange={(v) => setTab(v as any)}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-10 w-full sm:w-auto">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 shadow-sm flex-1 sm:flex-none">
                            Pending Review
                            <Badge variant="secondary" className="ml-2 bg-amber-100/50 text-amber-700">{courses.filter(c => c.status === 'pending_review' || c.status === 'pending').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="live" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary shadow-sm flex-1 sm:flex-none">
                            Live Courses
                        </TabsTrigger>
                        <TabsTrigger value="flagged" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-red-600 shadow-sm text-red-600 flex-1 sm:flex-none">
                            Flagged
                            {courses.filter(c => c.status === 'flagged' || (c.reports && c.reports > 0)).length > 0 && (
                                <Badge  className="ml-2">{courses.filter(c => c.status === 'flagged' || (c.reports && c.reports > 0)).length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex w-full sm:w-72 items-center space-x-2">
                        <Input 
                            type="search" 
                            placeholder="Search titles, teachers..." 
                            className="h-9 bg-white dark:bg-slate-900" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 bg-white dark:bg-slate-900">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p>Loading catalog...</p>
                    </div>
                ) : (
                    <>
                        <TabsContent value="pending" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCourses.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <Check className="h-12 w-12 text-slate-300 mb-2" />
                                        <p className="font-medium text-slate-900 dark:text-slate-200">You're all caught up!</p>
                                        <p className="text-sm mt-1">No courses are currently pending review.</p>
                                    </div>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <CourseCard 
                                            key={course.id} 
                                            course={course} 
                                            onApprove={() => handleApproveCourse(course.id)}
                                            onReject={() => handleOpenRejectModal(course.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="live" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCourses.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-slate-500">
                                        No live courses match your criteria.
                                    </div>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <CourseCard 
                                            key={course.id} 
                                            course={course} 
                                            onFlag={() => handleFlagCourse(course.id)}
                                            onReject={() => handleOpenRejectModal(course.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="flagged" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCourses.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                                        <Check className="h-12 w-12 text-slate-300 mb-2" />
                                        <p>No flagged or rejected courses.</p>
                                    </div>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <CourseCard 
                                            key={course.id} 
                                            course={course} 
                                            onApprove={() => handleApproveCourse(course.id)}
                                            onReject={() => handleOpenRejectModal(course.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {/* Reject Reason Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Reject Course</h3>
                            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting this course. The teacher will see this feedback.</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full min-h-[120px] p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:ring-2 focus:ring-primary outline-none"
                                placeholder="E.g., Insufficient content, misleading title, inappropriate material..."
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                            <Button 
                                 
                                onClick={handleRejectCourse}
                                disabled={actionLoading || !rejectReason.trim()}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Send Rejection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CourseCard = ({ course, onApprove, onReject, onFlag }: {
    course: Course;
    onApprove?: () => void;
    onReject?: () => void;
    onFlag?: () => void;
}) => {
    const viewCourseUrl = `/admin/moderation/courses/${course.id}`;
    
    return (
        <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative group">
            {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <BookOpen className="h-10 w-10 opacity-30" />
                </div>
            )}
            <Badge className={`absolute top-3 right-3 shadow-sm ${
                course.status === 'published' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                (course.status === 'pending_review' || course.status === 'pending') ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                course.status === 'rejected' ? 'bg-red-500 hover:bg-red-600 text-white' :
                course.status === 'draft' ? 'bg-slate-500 hover:bg-slate-600 text-white' :
                'bg-rose-600 hover:bg-rose-700 text-white'
            }`}>
                {course.status === 'published' ? 'Live' :
                 (course.status === 'pending_review' || course.status === 'pending') ? 'Pending' :
                 course.status === 'rejected' ? 'Rejected' :
                 course.status === 'draft' ? 'Draft' : 'Flagged'}
            </Badge>

            {/* Quick Preview overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-slate-900" onClick={() => window.open(viewCourseUrl, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" /> View Course
                </Button>
            </div>
        </div>

        <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {course.category}
                </span>
                {course.reports && course.reports > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1 py-0 h-5 text-[10px]">
                        <Flag className="h-3 w-3" /> {course.reports} flags
                    </Badge>
                )}
            </div>
            <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" title={course.title}>
                {course.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
                <Avatar className="h-5 w-5 border border-slate-200">
                    <AvatarImage src={course.teacherPhotoURL} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{course.teacherName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate text-slate-600 dark:text-slate-300">{course.teacherName}</span>
            </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-1 flex-1">
            <div className="flex items-center justify-between text-xs font-medium mt-1 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-primary">{typeof course.price === 'number' ? `₦${course.price.toLocaleString()}` : course.price}</span>
                <span className="text-slate-400">{new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
            {(course.status === 'pending_review' || course.status === 'pending') && (
                <>
                    <Button variant="default" size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
                        <Check className="h-4 w-4 mr-1.5" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={onReject}>
                        <X className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                </>
            )}

            {course.status === 'published' && (
                <div className="flex w-full gap-2">
                     <Button variant="outline" size="sm" className="flex-1" onClick={onFlag}>
                        <Flag className="h-4 w-4 mr-1.5 text-amber-500" /> Flag
                    </Button>
                    <Button variant="outline" size="sm" className="flex-none text-red-600 hover:bg-red-50" onClick={onReject}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {(course.status === 'flagged' || course.status === 'rejected') && (
                <>
                     <Button variant="outline" size="sm" className="flex-1" onClick={onApprove}>
                        <Check className="h-4 w-4 mr-1.5 text-green-600" /> Restore
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {course.status !== 'rejected' && (
                                <DropdownMenuItem className="text-red-600" onClick={onReject}>
                                    <X className="h-4 w-4 mr-2" /> Mark as Rejected
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <AlertCircle className="h-4 w-4 mr-2" /> Message Teacher
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </CardFooter>
    </Card>
    );
};
