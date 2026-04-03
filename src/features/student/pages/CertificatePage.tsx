import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, ArrowLeft } from 'lucide-react';        
import { Button } from '@/components/ui/button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Certificate {
    id: string;
    studentName: string;
    courseName: string;
    instructorName: string;
    issueDate: any;
    verificationCode: string;
}

export const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchCert = async () => {
         if (!id) return;
         try {
             const docRef = doc(db, 'certificates', id);
             const snap = await getDoc(docRef);
             if (snap.exists()) {
                 setCert({ id: snap.id, ...snap.data() } as Certificate);
             }
         } catch(e) {
             console.error(e);
         } finally {
             setLoading(false);
         }
     };
     fetchCert();
  }, [id]);

  const handleDownload = async () => {
    const element = document.getElementById('certificate-node');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Certificate-${id}.pdf`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Certificate',
          text: `I just completed ${cert?.courseName} on MyTutorMe!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch(e) {
      console.log('Share failed', e);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-primary"></div></div>;

  if (!cert) return <div className="text-center py-20">Certificate not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      <div className="mb-6">
        <Link to="/student/certificates" className="text-primary hover:underline flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to My Certificates
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Certificate of Completion</h1>
            <p className="text-slate-500">Verified and securely stored.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}><Share2 className="w-4 h-4" /> Share</Button>
             <Button onClick={handleDownload} className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white"><Download className="w-4 h-4" /> Download PDF</Button>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-8 rounded-2xl w-full max-w-[calc(100vw-2rem)] md:max-w-none overflow-x-auto shadow-inner flex md:justify-center">
        <div 
           id="certificate-node" 
           className="bg-white text-slate-900 relative w-[800px] h-[600px] flex flex-col items-center shadow-2xl shrink-0 overflow-hidden mx-auto"
           style={{ 
             background: 'radial-gradient(circle at center, #ffffff 0%, #f0fdf4 100%)',
           }}
        >
           {/* Decorative Outer Border */}
           <div className="absolute inset-5 border-2 border-primary/40 pointer-events-none"></div>
           {/* Decorative Inner Border */}
           <div className="absolute inset-[26px] border-[1px] border-primary/40 pointer-events-none"></div>
           {/* Corner Ornaments */}
           <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary pointer-events-none"></div>
           <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary pointer-events-none"></div>
           <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary pointer-events-none"></div>
           <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary pointer-events-none"></div>

           {/* Top Brand Logo */}
           <div className="mt-12 flex items-center gap-3">
              <img src="/icon.png" alt="Logo" className="w-10 h-10" crossOrigin="anonymous" />
              <span className="font-display font-black text-3xl tracking-tight text-slate-900 border-b-2 border-transparent">
                  MyTutor<span className="text-primary">Me</span>
              </span>
           </div>
           
           {/* Main Certificate Title */}
           <div className="mt-8 text-center space-y-1">
              <h2 className="text-[2.75rem] font-serif text-slate-800 tracking-[0.15em] font-black uppercase" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}>
                  Certificate
              </h2>
              <h3 className="text-[1.1rem] tracking-[0.3em] font-sans text-primary/80 font-bold uppercase">
                  Of Achievement
              </h3>
           </div>

           {/* Presentation Text */}
           <p className="text-lg italic text-slate-500 mt-8 mb-4 font-serif">
              This is proudly presented to
           </p>
           
           {/* Student Name */}
           <h1 className="text-5xl font-bold font-serif text-slate-900 mb-6 pb-2 px-12 border-b-[3px] border-primary/30 min-w-[500px] text-center">
              {cert.studentName}
           </h1>
           
           {/* Course Description */}
           <p className="text-sm text-slate-600 mb-2 font-sans uppercase tracking-widest font-semibold">
              For successfully completing the course
           </p>
           
           {/* Course Name */}
           <h3 className="text-2xl font-bold font-serif text-primary px-8 text-center max-w-2xl leading-tight mb-8">
              {cert.courseName}
           </h3>

           {/* Bottom Section: Signatures & Seal */}
           <div className="w-full flex justify-between items-end px-20 mt-auto mb-16">
               
               {/* Date Section */}
               <div className="text-center w-48 flex flex-col items-center">
                   <div className="border-b border-slate-400 w-full pb-1 mb-2 text-lg text-slate-700 font-serif min-h-[32px] flex items-end justify-center">
                     {cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date('2026-03-27').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                   </div>
                   <p className="text-[0.65rem] font-sans tracking-[0.2em] uppercase text-slate-400 font-bold">Date Issued</p>
               </div>

               {/* Center Seal */}
               <div className="relative flex justify-center items-center -mb-8">
                   <div className="w-32 h-32 rounded-full flex items-center justify-center relative bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] shadow-[0_4px_20px_rgba(22,163,74,0.15)] ring-8 ring-white">
                       {/* Inner dashed ring */}
                       <div className="absolute inset-2 border-[2px] border-primary/40 rounded-full border-dashed"></div>
                       {/* Double solid ring */}
                       <div className="absolute inset-0 border-[4px] border-primary/20 rounded-full"></div>
                       
                       <div className="relative z-10 flex flex-col items-center">
                           <img src="/icon.png" alt="Seal" className="w-12 h-12 mb-1" crossOrigin="anonymous" />
                           <span className="text-[0.55rem] font-bold text-primary uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">Verified</span>
                       </div>
                   </div>
               </div>

               {/* Signature Section */}
               <div className="text-center w-48 flex flex-col items-center">
                   <div className="border-b border-slate-400 w-full pb-1 mb-2 text-2xl text-slate-800 font-serif italic min-h-[32px] flex items-end justify-center">
                     {cert.instructorName}
                   </div>
                   <p className="text-[0.65rem] font-sans tracking-[0.2em] uppercase text-slate-400 font-bold">Instructor Signature</p>
               </div>
           </div>
           
           {/* Footer ID */}
           <div className="absolute bottom-5 text-[10px] font-sans text-slate-400 tracking-wider w-full text-center">
              CERTIFICATE ID: <span className="font-mono text-slate-500">{cert.verificationCode}</span> &nbsp;|&nbsp; VERIFY AT MYTUTORME.COM/VERIFY
           </div>
        </div>
      </div>
    </div>
  );
};
