import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Active Section highlighting
  useEffect(() => {
    const sections = ['platform', 'courses', 'pricing', 'resources'];
    const handleScroll = () => {
      // Offset for navbar height (~80px) plus some buffer
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Platform', href: '#platform' },
    { name: 'Courses', href: '#courses' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Resources', href: '#resources' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(href.replace('#', ''));
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(href.replace('#', ''));
    }
  };

  return (
    <nav className={cn(
      "fixed w-full z-50 transition-all duration-300 border-b",
      isScrolled 
        ? "bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-gray-100 dark:border-gray-800/60 shadow-sm py-2" 
        : "bg-transparent border-transparent py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img src="/icon.png" alt="MyTutorMe" className="w-10 h-10 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
              MyTutor<span className="text-primary">Me</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative",
                      isActive 
                        ? "text-white dark:text-white shadow-md bg-primary" 
                        : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4"> 
            <Link
              to="/login"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Join Now
            </Link>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 className="text-slate-600 dark:text-slate-300"
               >
                 {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-2">
            <div className="px-4 py-4 space-y-3">
                 {navItems.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-primary"
                    >
                        {item.name}
                    </a>
                 ))}
                 <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                     <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center px-4 py-3 rounded-md text-white bg-primary font-bold shadow-md hover:bg-primary-dark transition-colors"
                     >
                        Join Now
                     </Link>
                 </div>
            </div>
        </div>
      )}
    </nav>
  );
};
