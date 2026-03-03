export const CourseCreationPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen flex flex-col">
      <nav className="fixed w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                <span className="material-icons-round">school</span>
              </div>
              <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                Tutor<span className="text-primary">Me</span>{" "}
                <span className="text-xs text-slate-400 font-medium ml-2 uppercase tracking-widest hidden sm:inline-block">
                  Studio
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                Draft Saved
              </div>
              <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                <span className="material-icons-round text-xl">dark_mode</span>
              </button>
              <div className="flex items-center gap-2">
                <img
                  alt="Teacher"
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqFMV5i_F5nBcerMZKRgdFERpMGI5za3sOeDj89i7ryfUyYtliGMJEOFKw1R0SF4f8PIUYsYEihHlSNEt_Pf3Q3pjhLt0R1MkWz1zAddLGH_N1QT7cnt70A7EfYeRy_ES73OKZzmevrTNZuByXW9I4h8z-eJELyQ6gwks55-CTbcuVPKte2SFJJqhlLWPjrG_z6ZMp-srJEjirDItxYiYi7MYHgVYet3vN6wXiOUCLY9U81dF2OD3uaHypB4trqNgzH5FgjAQLNPc"
                />
                <span className="text-sm font-medium hidden sm:block">
                  Dr. A. Smith
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Create New Course
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Design your curriculum and reach students globally.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Save Draft
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
              <span>Publish Course</span>
              <span className="material-icons-round text-sm">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
        <div className="mb-12">
          <div className="flex items-center justify-between w-full relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary text-white flex items-center justify-center z-10 transition-all duration-300">
                <span className="material-icons-round">check</span>
              </div>
              <span className="text-xs font-bold text-primary hidden sm:block">
                Basic Info
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border-2 border-primary text-primary bg-background-light dark:bg-background-dark flex items-center justify-center z-10 shadow-[0_0_0_4px_rgba(22,163,74,0.2)] transition-all duration-300">
                <span className="material-icons-round">video_library</span>
              </div>
              <span className="text-xs font-bold text-primary hidden sm:block">
                Curriculum
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border-2 border-slate-200 text-slate-400 dark:border-slate-700 bg-background-light dark:bg-background-dark flex items-center justify-center z-10 transition-all duration-300 group-hover:border-slate-400 dark:group-hover:border-slate-500">
                <span className="material-icons-round">quiz</span>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Quizzes
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border-2 border-slate-200 text-slate-400 dark:border-slate-700 bg-background-light dark:bg-background-dark flex items-center justify-center z-10 transition-all duration-300 group-hover:border-slate-400 dark:group-hover:border-slate-500">
                <span className="material-icons-round">sell</span>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Pricing & Publish
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-icons-round text-primary">
                    layers
                  </span>
                  Curriculum Structure
                </h2>
                <button className="text-sm text-primary font-semibold hover:text-green-700 flex items-center gap-1">
                  <span className="material-icons-round text-lg">add</span> Add
                  Section
                </button>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-move">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-slate-400 cursor-grab">
                      drag_indicator
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Section 1: Introduction to Calculus
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-icons-round text-lg">edit</span>
                    </button>
                    <button className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-icons-round text-lg">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-surface-dark space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-icons-round text-slate-300">
                        drag_handle
                      </span>
                      <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-primary">
                        <span className="material-icons-round text-sm">
                          play_circle
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          1.1 What are limits?
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="material-icons-round text-[10px]">
                            schedule
                          </span>{" "}
                          12:05 • Video
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                        <span className="material-icons-round text-base">
                          edit
                        </span>
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500">
                        <span className="material-icons-round text-base">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-icons-round text-slate-300">
                        drag_handle
                      </span>
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                        <span className="material-icons-round text-sm">
                          description
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          1.2 Lecture Notes & Cheat Sheet
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="material-icons-round text-[10px]">
                            attachment
                          </span>{" "}
                          2.4 MB • PDF
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                        <span className="material-icons-round text-base">
                          edit
                        </span>
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500">
                        <span className="material-icons-round text-base">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                  <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 mt-2">
                    <span className="material-icons-round">
                      add_circle_outline
                    </span>{" "}
                    Add Content Item
                  </button>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-slate-400">
                      drag_indicator
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Section 2: Derivatives
                    </h3>
                  </div>
                  <span className="material-icons-round text-slate-400">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-3xl text-primary">
                  cloud_upload
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Upload Course Material
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Drag and drop your videos, PDFs, or slides here. <br />
                Supported formats: MP4, MOV, PDF, PPTX (Max 2GB)
              </p>
              <div className="flex justify-center gap-4">
                <button className="px-6 py-2.5 bg-primary hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-primary/25">
                  Browse Files
                </button>
                <button className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Import from Drive
                </button>
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <button className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Back: Basic Info
              </button>
              <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg">
                Next: Quizzes
              </button>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-round text-secondary">
                    auto_awesome
                  </span>
                  <h3 className="font-bold text-lg">AI Assistant</h3>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Need help structuring your course? I can generate a curriculum
                  based on your topic.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/10">
                  <p className="text-xs text-slate-300 italic">
                    "Generate a 4-week curriculum for Advanced Calculus focusing
                    on engineering applications"
                  </p>
                </div>
                <button className="w-full py-2 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors text-sm">
                  Generate Suggestions
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Quality Checklist
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-green-500 text-sm mt-0.5">
                    check_circle
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Course title is catchy
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-green-500 text-sm mt-0.5">
                    check_circle
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Learning objectives defined
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-slate-300 text-sm mt-0.5">
                    radio_button_unchecked
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    At least 3 video lectures
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-slate-300 text-sm mt-0.5">
                    radio_button_unchecked
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    One quiz per section
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-slate-300 text-sm mt-0.5">
                    radio_button_unchecked
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Course thumbnail uploaded
                  </span>
                </li>
              </ul>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Completeness
                  </span>
                  <span className="text-xs font-bold text-primary">40%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-icons-round text-slate-400 text-base">
                  info
                </span>
                Video Requirements
              </h4>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <p>
                  •{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Aspect Ratio:
                  </span>{" "}
                  16:9 (1920x1080)
                </p>
                <p>
                  •{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Format:
                  </span>{" "}
                  MP4 or MOV
                </p>
                <p>
                  •{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Audio:
                  </span>{" "}
                  Clear, synced audio required
                </p>
                <p>
                  •{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Max size:
                  </span>{" "}
                  2GB per file
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
