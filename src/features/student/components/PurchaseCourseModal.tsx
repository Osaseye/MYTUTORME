import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface PurchaseCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  price: string;
  onSuccess: () => void;
}

export const PurchaseCourseModal = ({ isOpen, onClose, courseId, courseTitle, price, onSuccess }: PurchaseCourseModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const { user } = useAuthStore();

  if (!isOpen) return null;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Please log in to purchase.");
        return;
    }
    
    setIsLoading(true);
    setStep('processing');

    try {
        const numericPrice = Number(String(price).replace(/[^0-9.-]+/g, ""));
        
        // Handle free courses directly without payment gateway
        if (numericPrice <= 0) {
            toast.success("Enrolling in Free Course...", { id: "enrollmentLoader" });
            setTimeout(() => {
                setIsLoading(false);
                onSuccess(); // Triggers the local handleEnrollSuccess
                onClose();
            }, 1000);
            return;
        }

        const initializeCoursePayment = httpsCallable(functions, 'initializeCoursePayment');
        
        const result: any = await initializeCoursePayment({
            courseId,
            courseTitle,
            amount: numericPrice,
            email: user?.email,
            userId: user?.uid,
            redirectUrl: window.location.origin + window.location.pathname
        });

        if (result.data?.authorizationUrl) {
            window.location.href = result.data.authorizationUrl; 
        } else {
            toast.error("Error initializing payment URL.");
            setIsLoading(false);
            setStep('details');
        }
    } catch (error: any) {
        console.error(error);
        toast.error("Failed to initialize course purchase", { description: error.message });
        setIsLoading(false);
        setStep('details');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
             <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Complete Enrollment</h2>
             <p className="text-sm text-slate-500 mt-1">
                Checkout for <span className="font-semibold text-primary">{courseTitle}</span>
             </p>
          </div>
          <button 
             onClick={onClose} 
             className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'details' && (
            <form onSubmit={handlePurchase} className="space-y-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center mb-6">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Price</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{price}</span>
                </div>

                <div className="pt-4 space-y-3">
                    <Button 
                        type="submit" 
                        className="w-full bg-[#f5a623] hover:bg-[#d48c15] text-white font-bold h-12 shadow-lg shadow-[#f5a623]/20 transition-all hover:-translate-y-0.5" 
                        disabled={isLoading}
                    >
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CreditCard className="w-5 h-5 mr-2" />}
                         {price.toLowerCase() === 'free' || price === '₦0' ? 'Enroll Now for Free' : 'Pay with Flutterwave'}
                    </Button>
                    <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5 opacity-80">
                        <ShieldCheck className="w-3 h-3 text-[#f5a623]" /> Secured by Flutterwave
                    </p>
                </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#f5a623] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Redirecting to Flutterwave...</h3>
                <p className="text-sm text-slate-500">You will be securely transferred to complete your payment.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-75 duration-300 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h3>
                <p className="text-slate-500 text-sm">You've successfully enrolled. Redirecting to your course dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
