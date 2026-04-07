import React, { useEffect, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourStore } from '@/app/stores/useTourStore';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TourManager = () => {
  const { isOpen, steps, currentStepIndex, nextStep, prevStep, skipTour } = useTourStore();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[currentStepIndex];

  const updateRect = () => {
    if (!currentStep?.targetId) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour-target="${currentStep.targetId}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    if (currentStep.targetId) {
      const el = document.querySelector(`[data-tour-target="${currentStep.targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(updateRect, 300); // Allow scroll to finish
      }
    } else {
      setTargetRect(null);
    }

    const handleScrollOrResize = () => requestAnimationFrame(updateRect);

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, currentStep]);

  if (!isOpen || !currentStep) return null;

  const isModalCenter = !currentStep.targetId || !targetRect;

  // Calculate Popover Position
  const getPopoverStyle = (): React.CSSProperties => {
    if (isModalCenter) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const margin = 16;
    const placement = currentStep.placement || 'bottom';
    
    // Mobile responsive safeguard
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
       // On mobile, just center it at bottom of the targeted element or bottom of screen
       return {
        top: targetRect!.bottom + margin,
        left: '50%',
        transform: 'translate(-50%, 0)',
        width: 'calc(100vw - 32px)',
        maxWidth: '400px'
       };
    }

    switch (placement) {
      case 'bottom':
        return {
          top: targetRect!.bottom + margin,
          left: targetRect!.left + targetRect!.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'top':
        return {
          top: targetRect!.top - margin,
          left: targetRect!.left + targetRect!.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'left':
        return {
          top: targetRect!.top + targetRect!.height / 2,
          left: targetRect!.left - margin,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetRect!.top + targetRect!.height / 2,
          left: targetRect!.right + margin,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-auto"
            style={{ 
              pointerEvents: currentStep.disableInteraction ? 'auto' : 'none',
              backgroundColor: 'rgba(0,0,0,0.6)'
            }}
          >
            {targetRect && (
              <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                <defs>
                  <mask id="tour-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <motion.rect
                      animate={{
                        x: targetRect.left - 8,
                        y: targetRect.top - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      rx={8}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0)" mask="url(#tour-mask)" />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, scale: 0.95, y: isModalCenter ? '-50%' : 10 }}
          animate={{ opacity: 1, scale: 1, y: isModalCenter ? '-50%' : 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`absolute pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 ${
            isModalCenter ? 'min-w-[320px] max-w-md' : 'w-80'
          }`}
          style={getPopoverStyle()}
        >
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              {currentStep.title}
            </h3>
            <button
              onClick={skipTour}
              className="text-slate-400 hover:text-slate-600 transition-colors mt-1"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            {currentStep.content}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {currentStepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  Back
                </Button>
              )}
              <Button size="sm" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};