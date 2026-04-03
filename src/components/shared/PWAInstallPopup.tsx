import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Share, MonitorSmartphone } from 'lucide-react';

export const PWAInstallPopup = ({ asMenuItem = false, hideButton = false }: { asMenuItem?: boolean; hideButton?: boolean }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    const hasSeenPrompt = localStorage.getItem('mytutorme_has_seen_install');

    if (!standalone && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowModal(true);
        localStorage.setItem('mytutorme_has_seen_install', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowModal(false);
      }
    } else if (isIOS) {
      // Allow them to look at iOS instructions in modal
    } else {
      alert("App installation is not currently supported by your browser or the app is already installed.");
      setShowModal(false);
    }
  };

  const openModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowModal(true);
  };

  if (isStandalone) return null;

  return (
    <>
      {!hideButton && (asMenuItem ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={openModal} 
          className="flex items-center justify-center gap-2 border-primary/20 text-primary hover:bg-primary/10 w-full md:w-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download App</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors shadow-sm"
          onClick={openModal}
        >
          <Download className="w-4 h-4" />
          <span className="font-semibold">Download App</span>
        </Button>
      ))}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex flex-col items-center justify-center relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mb-4 p-4 border border-slate-100 dark:border-slate-800">
                <img src="/icon.png" alt="MyTutorMe Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                Install MyTutorMe
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center mt-2 max-w-[280px]">
                Get a faster, more app-like experience by installing MyTutorMe directly to your device.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900">
              {isIOS ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                    <MonitorSmartphone className="w-4 h-4 text-primary" />
                    iOS Installation
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-3">
                      <span className="flex flex-shrink-0 items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs">1</span>
                      Tap the <Share className="w-4 h-4 text-blue-500 inline mx-1" /> Share button in your browser
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-3">
                      <span className="flex flex-shrink-0 items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs">2</span>
                      Scroll down and tap <span className="font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">Add to Home Screen</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                        <MonitorSmartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      Works offline and loads instantly with caching
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Takes up almost no storage space on your device
                    </li>
                  </ul>
                  <Button 
                    onClick={handleInstallClick} 
                    className="w-full font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
                  >
                    Install App Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};