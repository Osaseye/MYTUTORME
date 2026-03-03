import { Button } from "@/components/ui/button";
import { Search, Mail, MoreVertical, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const StudentsPage = () => {
  const students = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      course: "Advanced React Patterns",
      progress: 75,
      joined: "Oct 12, 2023",
      avatar: "/placeholder-1.jpg"
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      course: "UI/UX Design Fundamentals",
      progress: 45,
      joined: "Sep 28, 2023",
      avatar: "/placeholder-2.jpg"
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      course: "Advanced React Patterns",
      progress: 90,
      joined: "Nov 01, 2023",
      avatar: "/placeholder-3.jpg"
    },
     {
      id: 4,
      name: "Diana Prince",
      email: "diana@example.com",
      course: "Web Development Bootcamp",
      progress: 12,
      joined: "Nov 05, 2023",
      avatar: "/placeholder-4.jpg"
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Students
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Manage and track students enrolled in your courses.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" /> Message All
            </Button>
            <Button className="bg-primary hover:bg-green-700 text-white">
              Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search students..." className="pl-9" />
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Enrolled Course</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                          <div className="text-secondary-text">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {student.course}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {student.joined}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <span>Showing 4 of 128 students</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
