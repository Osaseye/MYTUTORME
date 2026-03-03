import { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  X, 
  AlertCircle, 
  MoreHorizontal, 
  Eye, 
  Flag,
  Search,
  Filter
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

export const CourseModerationPage = () => {
    const [courses] = useState([
        {
            id: 'c1',
            title: 'Complete WAEC Mathematics Prep 2026',
            instructor: 'Chinedu Okeke',
            price: '₦15,000',
            category: 'Mathematics',
            status: 'Pending Review',
            reports: 0,
            submitted: '2 hours ago',
            thumbnail: '/placeholder-course.jpg'
        },
        {
            id: 'c2',
            title: 'IELTS Speaking Masterclass',
            instructor: 'Funke Akindele',
            price: '₦25,000',
            category: 'Languages',
            status: 'Live',
            reports: 2,
            submitted: '1 week ago',
            thumbnail: '/placeholder-course-2.jpg'
        },
        {
            id: 'c3',
            title: 'Introduction to Yoruba History',
            instructor: 'Prof. Wole Soyinka (Fan Account)',
            price: '₦5,000',
            category: 'History',
            status: 'Flagged',
            reports: 15,
            submitted: '3 days ago',
            thumbnail: '/placeholder-course-3.jpg'
        }
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Course Moderation</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review new courses and manage flagged content.</p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <TabsList>
                        <TabsTrigger value="pending">Pending Review</TabsTrigger>
                        <TabsTrigger value="live">Live Courses</TabsTrigger>
                        <TabsTrigger value="flagged" className="text-red-600 data-[state=active]:text-red-700">Flagged</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input type="search" placeholder="Search courses..." className="h-9" />
                        <Button size="icon" variant="outline" className="h-9 w-9">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <TabsContent value="pending" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.filter(c => c.status === 'Pending Review').map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="live" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {courses.filter(c => c.status === 'Live').map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="flagged" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {courses.filter(c => c.status.includes('Flagged') || c.reports > 0).map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const CourseCard = ({ course }: { course: any }) => (
    <Card className="overflow-hidden">
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <BookOpen className="h-12 w-12 opacity-20" />
            </div>
            <Badge className={`absolute top-2 right-2 ${
                course.status === 'Live' ? 'bg-green-500 hover:bg-green-600' :
                course.status === 'Pending Review' ? 'bg-amber-500 hover:bg-amber-600' :
                'bg-red-500 hover:bg-red-600'
            }`}>
                {course.status}
            </Badge>
        </div>
        <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start gap-2">
                <Badge variant="outline" className="mb-2">{course.category}</Badge>
                {course.reports > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <Flag className="h-3 w-3" /> {course.reports}
                    </Badge>
                )}
            </div>
            <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5">
                    <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{course.instructor}</span>
            </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
            <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{course.price}</span>
                <span>{course.submitted}</span>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
            <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="text-green-600">
                        <Check className="h-4 w-4 mr-2" /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                        <X className="h-4 w-4 mr-2" /> Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <AlertCircle className="h-4 w-4 mr-2" /> Request Changes
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardFooter>
    </Card>
);
