import { Link } from "react-router-dom";

export const TeacherCoursesPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <main className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Course Management
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage your curriculum, track student progress, and analyze performance.
            </p>
          </div>
          <Link to="/teacher/courses/new">
            <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5">
              <span className="material-symbols-outlined">add</span>
              Create New Course
            </button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">
                search
              </span>
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
              placeholder="Search courses..."
              type="text"
            />
          </div>
          <div className="flex gap-4">
            <select className="block w-full sm:w-48 pl-3 pr-10 py-2.5 text-base border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <option>All Statuses</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Archived</option>
            </select>
            <select className="block w-full sm:w-48 pl-3 pr-10 py-2.5 text-base border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Highest Rated</option>
              <option>Most Enrolled</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    scope="col"
                  >
                    Course
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    scope="col"
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    scope="col"
                  >
                    Enrollments
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    scope="col"
                  >
                    Rating
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    scope="col"
                  >
                    Price
                  </th>
                  <th className="relative px-6 py-4" scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 relative">
                        <img
                          alt="Math Course"
                          className="h-full w-full object-cover"
                          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=3270&auto=format&fit=crop"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Advanced Calculus & Linear Algebra
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Updated 2 hours ago
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        1,234
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">
                          trending_up
                        </span>{" "}
                        +12% this week
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-slate-900 dark:text-white mr-2">
                        4.8
                      </span>
                      <div className="flex text-yellow-400 text-sm">
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined text-[16px]">
                          star_half
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 ml-1">(842)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                    ₦49,000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors tooltip-trigger"
                        title="Edit Content"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit_document
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        title="View Analytics"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          bar_chart
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Settings"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          settings
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 relative">
                        <img
                          alt="Python Course"
                          className="h-full w-full object-cover"
                          src="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=3274&auto=format&fit=crop"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Python for Data Science
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Updated yesterday
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        856
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">
                          trending_up
                        </span>{" "}
                        +5% this week
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-slate-900 dark:text-white mr-2">
                        5.0
                      </span>
                      <div className="flex text-yellow-400 text-sm">
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 ml-1">(120)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                    ₦59,000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Edit Content"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit_document
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        title="View Analytics"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          bar_chart
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Settings"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          settings
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">
                          science
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Organic Chemistry 101
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Created 2 days ago
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Draft
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      -
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Not rated yet
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Free
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Edit Content"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit_document
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        title="View Analytics"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          bar_chart
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Settings"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          settings
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 relative">
                        <img
                          alt="Chemistry Lab"
                          className="h-full w-full object-cover"
                          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=3270&auto=format&fit=crop"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Applied Physics for Engineering
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Updated 1 week ago
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        432
                      </span>
                      <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">
                          trending_down
                        </span>{" "}
                        -2% this week
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-slate-900 dark:text-white mr-2">
                        4.2
                      </span>
                      <div className="flex text-yellow-400 text-sm">
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined filled text-[16px]">
                          star
                        </span>
                        <span className="material-symbols-outlined text-[16px]">
                          star
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 ml-1">(45)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                    ₦39,000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Edit Content"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit_document
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        title="View Analytics"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          bar_chart
                        </span>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Settings"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          settings
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                1
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                4
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                12
              </span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                disabled={true}
              >
                Previous
              </button>
              <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
