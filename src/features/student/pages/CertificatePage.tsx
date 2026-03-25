import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, ArrowLeft, CheckCircle } from 'lucide-react';
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
             } else {
                 if (id === 'cert-123') {
                     setCert({
                         id: "cert-123",
                         studentName: "Student Name",
                         courseName: "Advanced Calculus & Linear Algebra",
                         instructorName: "Dr. Funke Adebayo",
                         issueDate: new Date(),
                         verificationCode: "MTM-994-291"
                     });
                 }
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

  if (loading) return <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-primary"></div></div>;

  if (!cert) return <div className="text-center py-20">Certificate not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/student/certificates" className="text-primary hover:underline flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to My Certificates
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Certificate of Completion</h1>
            <p className="text-slate-500">Verified and securely stored.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</Button>
             <Button onClick={handleDownload} className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white"><Download className="w-4 h-4" /> Download PDF</Button>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl flex justify-center overflow-x-auto">
        <div 
           id="certificate-node" 
           className="bg-white text-slate-900 border-8 border-double border-slate-200 p-12 text-center relative w-[800px] h-[600px] flex flex-col justify-center items-center shadow-xl font-serif shrink-0 space-y-6"
           style={{ backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f8fafc)' }}
        >
           <div className="absolute top-8 left-8 flex items-center gap-2 text-primary font-sans font-bold">
              <CheckCircle className="w-6 h-6" /> MyTutorMe Verify
           </div>
           
           <h2 className="text-4xl font-bold tracking-widest uppercase text-slate-400 mb-2">Certificate</h2>
           <p className="text-lg italic text-slate-600 mb-6">This is to certify that</p>
           
           <h1 className="text-5xl font-bold text-slate-800 mb-6 border-b-2 border-slate-300 pb-2 inline-block px-12">
              {cert.studentName}
           </h1>
           
           <p className="text-lg italic text-slate-600 mb-2">has successfully completed the course</p>
           <h3 className="text-2xl font-bold text-primary mb-12 max-w-2xl">
              {cert.courseName}
           </h3>

           <div className="w-full flex justify-between items-end px-12 mt-12">
               <div className="text-left">
                   <div className="border-b border-slate-400 w-48 pb-1 mb-2 font-handwriting text-2xl text-slate-700 text-center">{cert.instructorName}</div>
                   <p className="text-sm font-sans tracking-widest uppercase text-slate-500 text-center">Instructor</p>
               </div>
               <div className="text-right flex flex-col items-center">
                   <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center border-4 border-primary/20 mb-2 shadow-inner">
                       {/* <Award className="w-10 h-10 text-primary" /> */}
                   </div>
                   <p className="text-xs font-sans text-slate-400">ID: {cert.verificationCode}</p>
                   <p className="text-xs font-sans text-slate-400">Issued: {cert.issueDate?.toDate ? cert.issueDate.toDate().toLocaleDateString() : 'Today'}</p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};
