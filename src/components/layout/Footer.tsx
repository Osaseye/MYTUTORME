export const Footer = () => {
    return (
      <footer className="bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8" />
                <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  MyTutor<span className="text-primary">Me</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering students in emerging markets with world-class AI tutoring.
              </p>
            </div>
  
            {/* Links */}
            {[
              { title: 'Platform', links: ['Browse Courses', 'AI Tutor', 'Pricing', 'For Schools'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">{col.title}</h4>
                <ul className="space-y-3 text-sm text-slate-500">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
  
            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Stay Updated</h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
                <button className="bg-primary hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors shadow-md">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </div>
          </div>
  
          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} MyTutorMe Inc. All rights reserved.</p>
            <div className="flex gap-6 text-slate-400">
                {/* Social placeholders */}
                <span>Twitter</span>
                <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    );
  };
