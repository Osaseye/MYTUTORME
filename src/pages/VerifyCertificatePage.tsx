import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Award, Loader2, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface CertificateResult {
  id: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: any;
  verificationCode: string;
}

export const VerifyCertificatePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCode = searchParams.get('code') || '';
  
  const [code, setCode] = useState(queryCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (queryCode) {
      handleVerify(queryCode);
    }
  }, []);

  const handleVerify = async (verificationCode: string) => {
    if (!verificationCode.trim()) return;
    
    setIsVerifying(true);
    setHasSearched(true);
    setResult(null);

    // Update URL without reloading
    setSearchParams({ code: verificationCode });

    try {
      if (verificationCode === 'MTM-994-291') {
        // Mock data fallback for testing
        setTimeout(() => {
          setResult({
            id: 'cert-123',
            studentName: 'Student Name',
            courseName: 'Advanced Calculus & Linear Algebra',
            instructorName: 'Dr. Funke Adebayo',
            issueDate: new Date(),
            verificationCode: 'MTM-994-291'
          });
          setIsVerifying(false);
        }, 1000);
        return;
      }

      const q = query(collection(db, 'certificates'), where('verificationCode', '==', verificationCode));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setResult({ id: snap.docs[0].id, ...snap.docs[0].data() } as CertificateResult);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 py-20 bg-gradient-to-b from-emerald-50/50 to-slate-50">    
        <div className="max-w-xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center relative mb-2">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-150"></div>
              <img src="/icon.png" alt="MyTutorMe Logo" className="w-20 h-20 relative z-10 drop-shadow-sm" />
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900">Verify Certificate</h1>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              Enter the unique certificate verification code to validate its authenticity on our platform.
            </p>
          </div>

          <Card className="border-slate-200 shadow-xl shadow-slate-200/40">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" /> Certificate Lookup
              </CardTitle>
              <CardDescription>The verification code can be found at the bottom of the certificate.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="e.g. MTM-994-291" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 h-12 text-lg font-mono placeholder:font-sans"
                  required
                />
                <Button type="submit" size="lg" className="h-12 px-8 shadow-md" disabled={isVerifying || !code.trim()}>   
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                  {isVerifying ? 'Verifying...' : 'Verify Now'}
                </Button>
              </form>

              {hasSearched && !isVerifying && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {result ? (
                    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-emerald-50 to-teal-50/30 p-8 space-y-6 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 bg-primary text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg tracking-wider">Official Record</div>
                      
                      <div className="flex items-center gap-3 text-emerald-800 font-bold text-xl pb-4 border-b border-emerald-200/50">
                        <CheckCircle className="w-7 h-7 text-primary" />
                        Certificate is Valid
                      </div>

                      <div className="space-y-4 text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-white/50 pb-3">
                          <span className="text-emerald-700/80 font-medium">Recipient</span>
                          <span className="col-span-2 font-bold text-emerald-950 flex items-center gap-2 text-lg">
                            <Award className="w-4 h-4 text-emerald-600/50" /> {result.studentName}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-white/50 pb-3">
                          <span className="text-emerald-700/80 font-medium">Course</span>
                          <span className="col-span-2 font-semibold text-emerald-900">{result.courseName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-white/50 pb-3">
                          <span className="text-emerald-700/80 font-medium">Instructor</span>
                          <span className="col-span-2 font-semibold text-emerald-900">{result.instructorName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                          <span className="text-emerald-700/80 font-medium">Issue Date</span>
                          <span className="col-span-2 font-semibold text-emerald-900">
                            {result.issueDate?.seconds
                              ? format(new Date(result.issueDate.seconds * 1000), 'MMMM do, yyyy')
                              : result.issueDate instanceof Date
                                ? format(result.issueDate, 'MMMM do, yyyy')     
                                : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-8 text-center space-y-3 shadow-sm">
                      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <XCircle className="w-8 h-8" />   
                      </div>   
                      <h3 className="text-xl font-bold text-red-900">Certificate Not Found</h3>
                      <p className="text-red-700/80">
                        No official record matches the code <span className="font-mono bg-red-100 px-2 py-0.5 rounded text-red-800 font-semibold">"{searchParams.get('code')}"</span>. 
                      </p>
                      <p className="text-sm text-red-600/70 mt-2">Please double-check the code or contact support if you believe this is an error.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
