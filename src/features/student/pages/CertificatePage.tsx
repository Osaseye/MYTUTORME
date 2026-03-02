import React, { useRef } from 'react';
import { Award, Download, Share2, CheckCircle } from 'lucide-react';
import type { Certificate } from '../types/quiz';
import { Link, useParams } from 'react-router-dom';

// In a real app, this data would come from an API based on the ID
const MOCK_CERTIFICATE: Certificate = {
  id: 'CERT-2023-8892',
  studentName: 'Alex Johnson',
  courseName: 'Advanced Calculus & Derivatives',
  instructorName: 'Dr. Sarah Miller',
  issueDate: 'March 15, 2026',
  verificationCode: '8892-XTQ-2026',
  grade: '98%'
};

export const CertificatePage = () => {
  const { id } = useParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In a real implementation, use html2canvas or jspdf here
    alert("Downloading PDF certificate...");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center justify-center">
       <div className="w-full max-w-4xl mb-8 flex justify-between items-center">
            <Link to="/student/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                ← Back to Dashboard
            </Link>
            <div className="flex gap-3">
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                    <Share2 className="w-4 h-4" /> Share on LinkedIn
                </button>
            </div>
       </div>

       {/* Certificate Container */}
       <div className="w-full max-w-5xl aspect-[1.414/1] bg-white text-gray-900 shadow-2xl relative overflow-hidden" ref={certificateRef}>
          {/* Decorative Border */}
          <div className="absolute inset-4 border-[12px] border-double border-slate-900/10 pointer-events-none z-10"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-0 h-full flex flex-col items-center justify-center text-center p-24">
             {/* Logo */}
             <div className="mb-12 flex items-center justify-center gap-3">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center text-white shadow-xl">
                    <Award className="w-8 h-8" />
                </div>
                <div className="text-left">
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">MyTutor<span className="text-primary">Me</span></h1>
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Certificate of Completion</p>
                </div>
             </div>

             <div className="space-y-2 mb-12">
                 <p className="text-lg text-slate-500 font-serif italic">This certifies that</p>
                 <h2 className="text-5xl font-serif font-bold text-slate-900 border-b-2 border-slate-200 pb-4 px-12 inline-block">
                    {MOCK_CERTIFICATE.studentName}
                 </h2>
             </div>

             <div className="space-y-4 mb-16 max-w-2xl">
                 <p className="text-lg text-slate-600 leading-relaxed">
                    Has successfully completed the course requirements and passed the final assessment for
                 </p>
                 <h3 className="text-3xl font-bold text-primary">
                    {MOCK_CERTIFICATE.courseName}
                 </h3>
                 <p className="text-slate-500">
                    Demonstrating excellence and mastery of the subject matter with a final grade of <strong>{MOCK_CERTIFICATE.grade}</strong>.
                 </p>
             </div>

             <div className="flex justify-between items-end w-full px-12 mt-auto">
                 <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2 pb-1">
                        {/* Signature Image would go here */}
                         <span className="font-handwriting text-2xl text-slate-800">Sarah Miller</span>
                    </div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Instructor</p>
                 </div>

                 <div className="flex flex-col items-center gap-2">
                     <div className="h-20 w-20 border-4 border-slate-200 rounded-full flex items-center justify-center">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                     </div>
                     <p className="text-[10px] text-slate-400 font-mono">{MOCK_CERTIFICATE.verificationCode}</p>
                 </div>

                 <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2 pb-1">
                        <span className="text-xl text-slate-800">{MOCK_CERTIFICATE.issueDate}</span>
                    </div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Date Issued</p>
                 </div>
             </div>
          </div>
       </div>

       <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Certificate ID: <strong className="font-mono">{MOCK_CERTIFICATE.id}</strong> • Verify at mytutorme.com/verify
       </div>
    </div>
  );
};
