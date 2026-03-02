import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  MoreVertical, 
  Users, 
  Clock, 
  Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const TeacherCoursesPage = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      students: 1234,
      rating: 4.8,
      duration: '12h 30m',
      status: 'Published',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      price: '$49.99'
    },
    {
      id: 2,
      title: 'Node.js Microservices',
      students: 856,
      rating: 4.6,
      duration: '8h 15m',
      status: 'Draft',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      price: '$59.99'
    },
     {
      id: 3,
      title: 'UI/UX Design Fundamentals',
      students: 2100,
      rating: 4.9,
      duration: '22h 10m',
      status: 'Published',
      thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      price: '$39.99'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Courses</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your existing courses or create a new one.</p>
        </div>
        <Button onClick={() => navigate('/teacher/courses/new')} className="w-full md:w-auto gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-9 bg-slate-50 dark:bg-slate-800 border-none" placeholder="Search your courses..." />
         </div>
         <div className="flex gap-2">
             <Button variant="outline">Filter</Button>
             <Button variant="outline">Sort</Button>
         </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <div key={course.id} className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                 <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute top-2 right-2">
                     <Badge variant={course.status === 'Published' ? 'default' : 'secondary'} className={course.status === 'Published' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {course.status}
                     </Badge>
                 </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Course</DropdownMenuItem>
                            <DropdownMenuItem>Analytics</DropdownMenuItem>
                            <DropdownMenuItem>Manage Students</DropdownMenuItem>
                            <DropdownMenuTrigger className="text-red-600">Archive</DropdownMenuTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{course.rating}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-lg">{course.price}</span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">Edit</Button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
