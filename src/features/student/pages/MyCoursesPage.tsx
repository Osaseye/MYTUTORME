import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  LayoutGrid, 
  Star, 
  Clock, 
  PlayCircle, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const MyCoursesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8 md:mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Explore our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Knowledge Hub</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Master new skills with AI-enhanced courses designed for secondary and tertiary students.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-card-bg-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-8 sticky top-20 z-30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400" />
            </span>
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow" 
              placeholder="Search for physics, calculus, python..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {[
              { label: "Level: All", options: ["Secondary", "Tertiary"] },
              { label: "Subject: All", options: ["STEM", "Arts", "Business"] },
              { label: "Price: All", options: ["Free", "Premium"] }
            ].map((filter, idx) => (
              <select key={idx} className="py-2.5 pl-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:ring-primary focus:border-primary cursor-pointer min-w-[140px] outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em] bg-[right_0.7rem_center] bg-no-repeat">
                <option>{filter.label}</option>
                {filter.options.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          {/* Categories */}
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" /> Categories
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Mathematics", count: 124 },
                { name: "Computer Science", count: 86, checked: true },
                { name: "Physics", count: 42 },
                { name: "Literature", count: 38 },
                { name: "Economics", count: 55 }
              ].map((category, idx) => (
                <li key={idx}>
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${category.checked ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-800 group-hover:border-primary'}`}>
                      {category.checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${category.checked ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-secondary'} transition-colors`}>{category.name}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${category.checked ? 'text-primary bg-primary/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>{category.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Rating
            </h3>
            <div className="space-y-2">
              {[4, 3].map((rating, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-primary/50" />
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">& Up</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Duration
            </h3>
            <div className="space-y-2">
              {["0-2 Hours", "3-10 Hours", "10+ Hours"].map((duration, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 flex items-center justify-center group-hover:border-primary transition-colors"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{duration}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Grid */}
        <div className="flex-grow">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-900 dark:text-white">86</span> Computer Science Courses
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">Sort by:</span>
              <select className="py-1.5 pl-3 pr-8 rounded-lg border-none bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none appearance-none">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Highest Rated</option>
                <option>Price: Low to High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Course Card 1 */}
            <Link to="/student/courses/1" className="group bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  alt="Binary code on computer screen" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-md text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Premium
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center">
                  <PlayCircle className="w-3.5 h-3.5 mr-1" /> 12 Lessons
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Tertiary</span>
                  <div className="flex items-center text-yellow-400">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">4.8</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Advanced Python for Data Science</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Master pandas, numpy, and matplotlib for real-world data analysis.</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <img alt="Instructor" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Dr. A. Smith</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">$49.99</span>
                </div>
              </div>
            </Link>

            {/* Course Card 2 */}
             <Link to="/student/courses/2" className="group bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  alt="Math equations" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 right-3 bg-secondary text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-sm">
                  Free
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center">
                  <PlayCircle className="w-3.5 h-3.5 mr-1" /> 8 Lessons
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Secondary</span>
                  <div className="flex items-center text-yellow-400">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">4.5</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Introduction to Algebra II</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">A comprehensive guide to quadratic equations and functions.</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <img alt="Instructor" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Sarah J.</span>
                  </div>
                  <span className="font-bold text-primary">Free</span>
                </div>
              </div>
            </Link>

            {/* Course Card 3 */}
            <Link to="/student/courses/3" className="group bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  alt="Cybersecurity" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-md text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Premium
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center">
                  <PlayCircle className="w-3.5 h-3.5 mr-1" /> 24 Lessons
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Tertiary</span>
                  <div className="flex items-center text-yellow-400">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">4.9</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Cybersecurity Fundamentals</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Protect networks and data. Learn ethical hacking basics.</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <img alt="Instructor" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">M. Chen</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">$89.99</span>
                </div>
              </div>
            </Link>

            {/* Course Card 4 */}
            <div 
               className="group bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full cursor-pointer"
               onClick={() => {
                  toast.success("Enrolled Successfully!", {
                     description: "Welcome to Machine Learning with PyTorch. Redirecting to course..."
                  });
               }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  alt="Machine Learning" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1527474305487-b87b222841cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-md text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Premium
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center">
                  <PlayCircle className="w-3.5 h-3.5 mr-1" /> 18 Lessons
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Tertiary</span>
                  <div className="flex items-center text-yellow-400">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">4.7</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Machine Learning with PyTorch</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Build neural networks and AI models from scratch.</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <img alt="Instructor" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Elena R.</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">$65.00</span>
                </div>
              </div>
            </div>

            {/* Course Card 5 */}
            <Link to="/student/courses/5" className="group bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  alt="Physics lab" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 right-3 bg-secondary text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-sm">
                  Free
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center">
                  <PlayCircle className="w-3.5 h-3.5 mr-1" /> 10 Lessons
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Secondary</span>
                  <div className="flex items-center text-yellow-400">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">4.6</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Physics: Forces & Motion</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Understanding Newton's laws through experiments.</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <img alt="Instructor" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">David K.</span>
                  </div>
                  <span className="font-bold text-primary">Free</span>
                </div>
              </div>
            </Link>

            {/* Course Card 6 */}
            <Link to="/student/courses/6" className="group bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  alt="Web Development" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-md text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Premium
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center">
                  <PlayCircle className="w-3.5 h-3.5 mr-1" /> 32 Lessons
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Tertiary</span>
                  <div className="flex items-center text-yellow-400">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">4.9</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Full Stack Web Development</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">HTML, CSS, JS, React, Node.js - From zero to hero.</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <img alt="Instructor" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Amanda L.</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">$99.00</span>
                </div>
              </div>
            </Link>
          </div>

           {/* Pagination */}
           <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-bg-dark text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 rounded-lg border border-primary bg-primary text-white font-medium">1</button>
              <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-bg-dark text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">2</button>
              <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-bg-dark text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">3</button>
              <span className="text-slate-500 px-2">...</span>
              <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-bg-dark text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">12</button>
              <button className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-bg-dark text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};