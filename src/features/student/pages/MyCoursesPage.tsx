import {
  Search,
  LayoutGrid,
  Star,
  Clock,
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react';

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
            <div className="col-span-full py-20 text-center text-slate-500 bg-white dark:bg-card-bg-dark rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-lg">No courses available at the moment.</p>
            </div>
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