import { 
  GraduationCap, 
  Filter, 
  Plus, 
  CheckCircle, 
  Code, 
  FlaskConical, 
  ScrollText, 
  ChevronDown, 
  Star,
  Download,
  Share2,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MOCK_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Advanced Calculus & Linear Algebra',
    instructor: 'Dr. A. Smith',
    category: 'Mathematics',
    categoryColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    issueDate: 'Oct 24, 2024',
    icon: GraduationCap,
    iconColor: 'bg-primary',
    borderColor: 'border-primary/20',
    verified: true
  },
  {
    id: 'cert-2',
    title: 'Python for Data Science',
    instructor: 'Sarah J.',
    category: 'Computer Science',
    categoryColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    issueDate: 'Sep 12, 2024',
    icon: Code,
    iconColor: 'bg-purple-500',
    borderColor: 'border-purple-500/20',
    verified: true
  },
  {
    id: 'cert-3',
    title: 'Organic Chemistry Fundamentals',
    instructor: 'Prof. Chen',
    category: 'Science',
    categoryColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    issueDate: 'Aug 05, 2024',
    icon: FlaskConical,
    iconColor: 'bg-orange-500',
    borderColor: 'border-orange-500/20',
    verified: true
  },
  {
    id: 'cert-4',
    title: 'World History: 1900-Present',
    instructor: 'Dr. R. Geller',
    category: 'Humanities',
    categoryColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    issueDate: 'Jul 20, 2024',
    icon: ScrollText,
    iconColor: 'bg-indigo-500',
    borderColor: 'border-indigo-500/20',
    verified: true
  }
];

export const MyCertificatesPage = () => {
  const handleDownload = (certTitle: string) => {
    toast.success('Certificate Download Started', {
        description: `Downloading high-res PDF for ${certTitle}...` 
    });
  };

  const handleShare = (certTitle: string) => {
    toast.info('Shared Successfully', {
        description: `${certTitle} has been added to your public profile.`
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Certificates</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Showcase your achievements and verified skills.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button className="bg-primary hover:bg-green-700 text-white flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add External
              </Button>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {MOCK_CERTIFICATES.map((cert) => (
              <div key={cert.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                
                {/* Certificate Preview Card */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                  
                  <Link to={`/student/certificates/${cert.id}`} className="w-full h-full block">
                    <div className="w-full h-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 p-4 relative transform group-hover:scale-105 transition-transform duration-500 cursor-pointer">
                      <div className={`border-2 ${cert.borderColor} h-full w-full p-2 flex flex-col items-center justify-center text-center`}>
                        <div className={`w-8 h-8 ${cert.iconColor} rounded-full mb-2 flex items-center justify-center text-white`}>
                          <cert.icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm">Certificate of Completion</h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{cert.title}</p>
                      </div>
                    </div>
                  </Link>

                  {cert.verified && (
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2 py-1 rounded-full border border-green-200 dark:border-green-900 flex items-center gap-1 shadow-sm">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">Verified</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cert.categoryColor}`}>
                      {cert.category}
                    </span>
                    <span className="text-xs text-slate-500">Issued: {cert.issueDate}</span>
                  </div>
                  
                  <Link to={`/student/certificates/${cert.id}`} className="hover:text-primary transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {cert.title}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Instructor: {cert.instructor}</p>
                  
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownload(cert.title)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-10 h-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => handleShare(cert.title)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="ghost" className="text-slate-500 hover:text-primary">
              Show archived certificates
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          
          {/* Stats Card */}
          <div className="bg-gradient-to-br from-primary to-green-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="font-display font-bold text-lg mb-4">Total Certifications</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-extrabold">12</span>
                <span className="text-green-200 mb-1 font-medium">Earned</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-1.5 mb-4">
                <div className="bg-white h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-green-100">You are in the top 5% of students this month!</p>
            </div>
          </div>

          {/* Active Courses Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Active Courses</h3>
              <button className="text-xs font-semibold text-primary hover:text-green-700">View All</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { title: 'Quantum Mechanics 101', progress: 85, category: 'Physics', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300', next: 'Wave Functions Quiz' },
                { title: 'Modern African Literature', progress: 42, category: 'Literature', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300', next: 'Reading: Chapter 4' },
                { title: 'Microeconomics Intro', progress: 12, category: 'Economics', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300', next: 'Video: Supply & Demand' }
              ].map((course, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${course.color}`}>
                      {course.category}
                    </span>
                    <span className="text-xs text-slate-400">{course.progress}%</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-1">{course.title}</h4>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500">Next: {course.next}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Recommended Certification</h4>
            <div className="flex gap-3 mb-3">
              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                 <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 mb-1">Advanced Machine Learning</h5>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>4.9 (2.1k)</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white h-8 text-xs font-bold">
              View Details
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
