import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Monitor, 
  Award, 
  Star, 
  Users, 
  Calendar, 
  ChevronDown, 
  Share2, 
  ArrowRight,
  School
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CourseDetailsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm text-slate-500 dark:text-slate-400">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/student/dashboard" className="hover:text-primary transition-colors">Home</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li className="inline-flex items-center">
            <Link to="/student/courses" className="hover:text-primary transition-colors">My Courses</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li className="font-medium text-slate-900 dark:text-white">Advanced Calculus & Linear Algebra</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <CheckCircle className="w-3 h-3 mr-1" /> CERTIFIED COURSE
              </Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
                Mathematics
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
              Advanced Calculus & Linear Algebra
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Master derivatives, integrals, and vector spaces with AI assistance. Designed for university students aiming for top grades.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current opacity-50" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white ml-1">4.8</span>
                <span>(1,240 ratings)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>8,500+ Students</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Last updated May 2025</span>
              </div>
            </div>
          </div>

          {/* Video/Image Preview Area */}
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 relative group aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
             {/* Using placeholder icon as requested */}
             <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img 
                  src="/icon.png" 
                  alt="Course Preview" 
                  className="w-32 h-32 object-contain opacity-80"
                  onError={(e) => {
                    // Fallback if icon.png doesn't exist or load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-slate-800', 'to-slate-900');
                  }}
                />
                 {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors cursor-pointer">
                  <button className="w-20 h-20 bg-primary hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                    <PlayCircle className="w-10 h-10 ml-1" />
                  </button>
                </div>
             </div>
          </div>

          {/* About Course */}
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">About this course</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4">
              <p>
                This comprehensive course bridges the gap between introductory calculus and advanced mathematical analysis. You will dive deep into multivariable calculus, differential equations, and the core concepts of linear algebra that are essential for physics, engineering, and data science in the Nigerian and global tech ecosystem.
              </p>
              <p>
                Our AI-powered platform provides real-time feedback on your problem sets, ensuring you understand the "why" behind every "how", tailored for students from UNILAG, OAU, UNN, and other top institutions.
              </p>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">What you'll learn</h3>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  "Master partial derivatives and multiple integrals",
                  "Solve complex linear systems using matrices",
                  "Understand vector spaces and eigenvalues",
                  "Apply mathematical concepts to real-world models"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Course Curriculum */}
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Course Curriculum</h2>
            <div className="space-y-4">
              {/* Box 1 - Expanded */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Section 1: Introduction to Vectors</span>
                  </div>
                  <span className="text-sm text-slate-500">5 lectures • 45m</span>
                </button>
                <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4" />
                        <span>Vectors in Rn Space</span>
                      </div>
                      <span className="text-primary text-xs font-bold border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">Preview</span>
                    </li>
                    <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4" />
                        <span>Dot Product & Projections</span>
                      </div>
                      <span>10:30</span>
                    </li>
                    <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4" />
                        <span>Cross Product</span>
                      </div>
                      <span>12:15</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Box 2 - Collapsed */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90" />
                    <span className="font-semibold text-slate-900 dark:text-white">Section 2: Matrices & Linear Transformations</span>
                  </div>
                  <span className="text-sm text-slate-500">8 lectures • 1h 20m</span>
                </button>
              </div>

              {/* Box 3 - Collapsed */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90" />
                    <span className="font-semibold text-slate-900 dark:text-white">Section 3: Limits & Continuity</span>
                  </div>
                  <span className="text-sm text-slate-500">6 lectures • 55m</span>
                </button>
              </div>
            </div>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Instructor</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <img 
                alt="Dr. Adebayo" 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20" 
                src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Funke Adebayo</h3>
                <p className="text-primary text-sm font-medium mb-3">Professor of Mathematics, University of Lagos</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <School className="w-4 h-4 text-slate-500" />
                    <span>12 Courses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>45k Students</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Dr. Adebayo is a renowned mathematician with over 15 years of teaching experience. She specializes in making complex abstract concepts accessible and visual. Her research focuses on applied linear algebra in machine learning algorithms within the African fintech space.
                </p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Student Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">CO</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Chinedu Okeke</p>
                      <p className="text-xs text-slate-500">2 weeks ago</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                  "The AI tutor feature is a game changer. I was stuck on eigenvectors for days, but the personalized breakdown helped me visualize it instantly."
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">ZA</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Zainab Ahmed</p>
                      <p className="text-xs text-slate-500">1 month ago</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current opacity-50" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                  "Excellent course structure. Dr. Adebayo explains things very clearly. I wish there were a few more practice problems on integrals, but otherwise perfect."
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button variant="link" className="text-primary font-semibold">View all reviews</Button>
            </div>
          </section>

        </div>

        {/* Sidebar/Sticky Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            {/* Pricing Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">₦49,000</span>
                <span className="text-lg text-slate-400 line-through mb-1">₦199,000</span>
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">75% OFF</Badge>
              </div>
              
              <div className="space-y-3 mb-6">
                <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-green-700 shadow-lg shadow-primary/30">
                  Enroll Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" className="w-full h-12 text-base font-bold border-2">
                  Add to Cart
                </Button>
              </div>
              
              <p className="text-center text-xs text-slate-500 mb-6">30-Day Money-Back Guarantee</p>
              
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-2">This course includes:</h4>
                {[
                  { icon: Clock, text: "24 hours on-demand video" },
                  { icon: Monitor, text: "Unlimited AI Tutor Access" },
                  { icon: FileText, text: "15 Downloadable resources" },
                  { icon: Share2, text: "Access on mobile and TV" },
                  { icon: Award, text: "Certificate of completion" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Training 5 or more people?</h3>
              <p className="text-slate-300 text-sm mb-4 relative z-10">Get your team access to TutorMe's top 5,000+ courses anytime, anywhere.</p>
              <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white border-transparent relative z-10">
                Get TutorMe Business
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
