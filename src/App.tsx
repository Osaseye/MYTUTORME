import { useState, useEffect } from 'react';
import { AppProvider } from './app/providers/app-provider';
import { AppRoutes } from './app/routes';
import { GlobalLoader } from './components/ui/global-loader';
import { AnimatePresence, motion } from 'framer-motion';
import { PWAInstallPopup } from '@/components/shared/PWAInstallPopup';
import { PWAUpdatePrompt } from '@/components/shared/PWAUpdatePrompt';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Artificial delay to guarantee the beautiful typewriter animation runs.
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2800); // 2.8 seconds gives enough time for the typewriter effect to complete
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {isInitializing ? (
          <motion.div 
            key="initial-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[100]"
          >
            <GlobalLoader />
          </motion.div>
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AppRoutes />
            <PWAInstallPopup hideButton={true} />
            <PWAUpdatePrompt />
          </motion.div>
        )}
      </AnimatePresence>
    </AppProvider>
  );
}

export default App;
