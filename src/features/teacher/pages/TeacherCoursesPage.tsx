import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const TeacherCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'courses'),
          where('teacherId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedCourses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading courses...</p>
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">school</span>
                      <p>You haven't created any courses yet.</p>
                      <Link to="/teacher/courses/new" className="text-primary hover:underline mt-2 inline-block">
                        Create your first course
                      </Link>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                      <tr 
                         key={course.id} 
                         className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                         onClick={() => window.location.href = `/teacher/courses/${course.id}`}
                      >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} className="h-10 w-10 rounded object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400">play_lesson</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-900 dark:text-white">{course.title || 'Untitled Course'}</div>
                            <div className="text-sm text-slate-500">{course.subject || 'Uncategorized'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          course.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          course.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {course.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {course.enrollmentCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-yellow-400 text-sm mr-1">star</span>
                          {course.rating || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {course.pricingType === 'free' || !course.price ? 'Free' : `₦${course.price.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/teacher/courses/${course.id}`} 
                          className="text-primary hover:text-green-700 font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-900 dark:text-white">0</span>{" "}
              to{" "}
              <span className="font-medium text-slate-900 dark:text-white">0</span>{" "}
              of{" "}
              <span className="font-medium text-slate-900 dark:text-white">0</span>{" "}
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
