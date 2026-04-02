import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (provider: 'flutterwave') => Promise<void>;
    isLoading?: boolean;
    planName?: string;
}

export const PaymentModal = ({ isOpen, onClose, onConfirm, isLoading = false, planName = "Premium Plan" }: PaymentModalProps) => {
    const [selectedProvider, setSelectedProvider] = useState<'flutterwave'>('flutterwave');

    const handleConfirm = async () => {
        try {
            await onConfirm(selectedProvider);
        } catch (error) {
            toast.error("Failed to initialize payment");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col space-y-1.5 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-none tracking-tight">Complete Your Upgrade</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors pointer-events-auto">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        You are upgrading to <strong>{planName}</strong>. Choose your secure payment provider.
                    </p>
                </div>
                <div className="p-6 pt-0">
                    <div className="flex flex-col gap-4 py-4">
                        {/* Flutterwave Option */}
                        <button 
                            onClick={() => setSelectedProvider('flutterwave')}
                            className={`flex items-center p-4 border-2 rounded-xl transition-all ${selectedProvider === 'flutterwave' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'}`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f5a623]/10 text-[#f5a623] mr-4">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-semibold text-slate-900 dark:text-white">Flutterwave</div>
                                <div className="text-xs text-slate-500">Pay securely with Cards, Bank Transfer, or USSD</div>
                            </div>
                            {selectedProvider === 'flutterwave' && (
                                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                </div>
                            )}
                        </button>

                        {/* Paystack Option (Coming Soon) */}
                        <button 
                            disabled
                            className="flex items-center p-4 border-2 border-slate-200 rounded-xl opacity-60 cursor-not-allowed dark:border-slate-700"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0ba4db]/10 text-[#0ba4db] mr-4">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-semibold text-slate-900 dark:text-white line-through decoration-slate-400">Paystack</div>
                                <div className="text-xs text-slate-500">Currently undergoing maintenance</div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                Coming Soon
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center flex-row-reverse sm:justify-start gap-3 p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <Button onClick={handleConfirm} disabled={isLoading} className="gap-2 shrink-0">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Proceed to Payment
                    </Button>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};
