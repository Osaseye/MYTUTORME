import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  price: string;
  onSuccess: () => void;
}

export const PurchaseCourseModal = ({ isOpen, onClose, courseTitle, price, onSuccess }: PurchaseCourseModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  if (!isOpen) return null;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('processing');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      toast.success("Enrollment Successful!", {
        description: `You now have full access to ${courseTitle}.`
      });
      setTimeout(() => {
         onSuccess();
         onClose();
         setStep('details');
      }, 2000);
    }, 2000);
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cardholder Name</label>
                    <Input id="name" placeholder="John Doe" required className="bg-white dark:bg-slate-900" />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Card Number</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input id="number" className="pl-9 bg-white dark:bg-slate-900" placeholder="0000 0000 0000 0000" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expiry</label>
                        <Input id="expiry" placeholder="MM/YY" required className="bg-white dark:bg-slate-900" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CVC</label>
                        <Input id="cvc" placeholder="123" required className="bg-white dark:bg-slate-900" />
                    </div>
                </div>

                <div className="pt-4 space-y-3">
                    <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-green-700 text-white font-bold h-12 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" 
                        disabled={isLoading}
                    >
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                         Pay {price}
                    </Button>
                    <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5 opacity-80">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> Secured by Paystack
                    </p>
                </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Processing Payment...</h3>
                <p className="text-sm text-slate-500">Please verify the transaction on your device if prompted.</p>
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
