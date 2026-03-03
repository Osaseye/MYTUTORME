import { useState } from "react";

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen flex flex-col">
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Settings
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage your account preferences
                </p>
              </div>
              <nav className="p-4 space-y-1">
                <a
                  href="#"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "profile"
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <span className="material-symbols-outlined">person</span>
                  Personal Info
                </a>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "academic"
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveTab("academic")}
                >
                  <span className="material-symbols-outlined">school</span>
                  Academic Level
                </a>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "subscription"
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveTab("subscription")}
                >
                  <span className="material-symbols-outlined">credit_card</span>
                  Subscription
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  Notifications
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">security</span>
                  Security
                </a>
              </nav>
            </div>
          </aside>
          <div className="flex-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
              <div className="relative flex flex-col sm:flex-row items-end sm:items-center gap-6 mt-8">
                <div className="relative group">
                  <img
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-md object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV481tCcfzktfvCFd_UkzJt3f0wlu0qg3hkvgGLKR134CXxHf_CJ-U0iKYU3pnup_Atpypv9Sp2M0tTBPqk2-16cY5RKLDQRYWGIECEns5vr8kwnoebF-sAsD-vNC42_XyU0c78ds6f-LhAmku7hBv4j6MKT0FX7tbEY3KcwrPVLuDytD4ER2_2RPCxW41AKxEt9MJyxRc7wdDYELwHWF672W40F2LWwiZA94pLtv5uu5LyioDeMM-agFlH7n6lymvTrtOZsCGWLs"
                  />
                  <button className="absolute bottom-0 right-0 bg-primary hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors border-2 border-white dark:border-slate-900">
                    <span className="material-symbols-outlined text-sm">
                      edit
                    </span>
                  </button>
                </div>
                <div className="flex-1 pb-2">
                  <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                    Alex Morgan
                  </h1>
                  <p className="text-slate-500">
                    Student • University of Lagos
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-green-700 rounded-lg shadow-sm shadow-primary/30 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  badge
                </span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="full-name"
                  >
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                    id="full-name"
                    name="full-name"
                    type="text"
                    defaultValue="Alex Morgan"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                    id="email"
                    name="email"
                    type="email"
                    defaultValue="alex.morgan@student.edu"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <input
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                    id="phone"
                    name="phone"
                    placeholder="+234 800 000 0000"
                    type="tel"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="timezone"
                  >
                    Timezone
                  </label>
                  <select
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                    id="timezone"
                    name="timezone"
                  >
                    <option>West Africa Time (WAT)</option>
                    <option>Central Africa Time (CAT)</option>
                    <option>East Africa Time (EAT)</option>
                    <option>Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">
                    school
                  </span>
                  Academic Preferences
                </h3>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                  Auto-saved
                </span>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      htmlFor="education-level"
                    >
                      Current Education Level
                    </label>
                    <select
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                      id="education-level"
                    >
                      <option>Secondary School (Year 10-12)</option>
                      <option selected>Undergraduate (University)</option>
                      <option>Postgraduate</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      htmlFor="major"
                    >
                      Major / Field of Study
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                      id="major"
                      type="text"
                      defaultValue="Computer Science"
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-4">
                    Preferred Grading System
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="relative flex cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm focus:outline-none ring-offset-2 ring-primary has-[:checked]:ring-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                      <input
                        className="sr-only"
                        name="grading-system"
                        type="radio"
                        value="4.0"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">
                            4.0 Scale
                          </span>
                          <span className="mt-1 flex items-center text-xs text-slate-500">
                            GPA System
                          </span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-primary invisible peer-checked:visible"
                      >
                        check_circle
                      </span>
                    </label>
                    <label className="relative flex cursor-pointer rounded-xl border border-primary dark:border-primary bg-primary/5 dark:bg-primary/10 p-4 shadow-sm focus:outline-none ring-2 ring-primary ring-offset-2 transition-all">
                      <input
                        className="sr-only"
                        name="grading-system"
                        type="radio"
                        value="5.0"
                        defaultChecked
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">
                            5.0 Scale
                          </span>
                          <span className="mt-1 flex items-center text-xs text-slate-500">
                            CGPA System
                          </span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-primary"
                      >
                        check_circle
                      </span>
                    </label>
                    <label className="relative flex cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm focus:outline-none ring-offset-2 ring-primary has-[:checked]:ring-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                      <input
                        className="sr-only"
                        name="grading-system"
                        type="radio"
                        value="100"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">
                            Percentage
                          </span>
                          <span className="mt-1 flex items-center text-xs text-slate-500">
                            0 - 100%
                          </span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-primary invisible peer-checked:visible"
                      >
                        check_circle
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">
                  workspace_premium
                </span>
                Subscription Plan
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Current Plan
                    </p>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      Free Plan
                    </h4>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-300">
                    Valid until Forever
                  </span>
                </div>
              </div>
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-primary to-green-700 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                      Upgrade to Premium
                      <span className="material-symbols-outlined text-yellow-300">
                        star
                      </span>
                    </h4>
                    <p className="text-green-50 text-sm max-w-md">
                      Unlock unlimited AI queries, advanced GPA prediction
                      models, and verified certificates for completed courses.
                    </p>
                  </div>
                  <button className="whitespace-nowrap px-6 py-3 bg-white text-primary font-bold rounded-lg shadow-md hover:bg-green-50 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
