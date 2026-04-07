import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useTourStore } from '@/app/stores/useTourStore';

interface Certificate {
    id: string;
    courseId: string;
    courseName: string;
    instructorName: string;
    issueDate: any;
    verificationCode: string;
    pdfURL?: string;
    grade?: string;
}

export const MyCertificatesPage = () => {
  const { user } = useAuthStore();
  const { startTour } = useTourStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour('my-certificates-tour', [
        {
          target: 'cert-header',
          title: 'Certificates & Achievements',
          content: 'View all the accomplishments and certificates you have earned upon completing courses.',
          placement: 'bottom'
        },
        {
          target: 'cert-grid',
          title: 'Your Awards',
          content: 'Click to view, download, or share verified certificates validating your skills.',
          placement: 'top'
        }
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [startTour]);

  useEffect(() => {
     const fetchCerts = async () => {
         if (!user) return;
         try {
             const q = query(collection(db, 'certificates'), where('studentId', '==', user.uid));
             const snap = await getDocs(q);
             if (!snap.empty) {
                 setCertificates(snap.docs.map(d => ({id: d.id, ...d.data()})) as Certificate[]);
             }
         } catch(e) {
             console.error(e);
         } finally {
             setLoading(false);
         }
     };
     fetchCerts();
  }, [user]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full">
        <div>
          
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div data-tour-target="cert-header">
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Certificates</h1>
            </div>
          </div>

          {loading ? (
             <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-primary"></div></div>
          ) : certificates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Certificates</h3>
            </div>
          ) : (
            <div data-tour-target="cert-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {certificates.map(cert => (
                   <div key={cert.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl"><Award className="w-6 h-6 text-primary" /></div>
                            <Badge className="bg-slate-100 text-slate-700">{cert.grade || 'Completed'}</Badge>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{cert.courseName}</h3>
                        <p className="text-sm text-slate-500 mb-6">Instructor: {cert.instructorName}</p>
                        <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Link to={`/student/certificates/${cert.id}`} className="flex-1">
                                <Button className="w-full text-white bg-primary">View Certificate</Button>
                            </Link>
                        </div>
                   </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
