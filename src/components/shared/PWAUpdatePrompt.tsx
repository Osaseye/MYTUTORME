import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export const PWAUpdatePrompt = () => {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      toast('A new version of MyTutorMe is available!', {
        id: 'pwa-update',
        duration: Infinity,
        action: {
          label: 'Update Now',
          onClick: () => updateServiceWorker(true),
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
};
