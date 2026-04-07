import { create } from 'zustand';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  targetId?: string; // If undefined, modal appears in center
  title: string;
  content: React.ReactNode | string;
  placement?: TourPlacement;
  disableInteraction?: boolean;
}

interface TourState {
  isOpen: boolean;
  steps: TourStep[];
  currentStepIndex: number;
  tourId: string | null;
  startTour: (tourId: string, steps: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  closeTour: () => void;
  skipTour: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  isOpen: false,
  steps: [],
  currentStepIndex: 0,
  tourId: null,

  startTour: (tourId, steps) => {
    // Optionally check local storage to prevent re-running
    const hasSeen = localStorage.getItem(`tour_completed_${tourId}`);
    if (hasSeen === 'true') return;

    set({
      isOpen: true,
      steps,
      currentStepIndex: 0,
      tourId,
    });
  },

  nextStep: () => {
    const { currentStepIndex, steps, tourId } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      // End of tour
      if (tourId) {
        localStorage.setItem(`tour_completed_${tourId}`, 'true');
      }
      set({ isOpen: false, tourId: null, steps: [], currentStepIndex: 0 });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  closeTour: () => set({ isOpen: false }),

  skipTour: () => {
    const { tourId } = get();
    if (tourId) {
      localStorage.setItem(`tour_completed_${tourId}`, 'true');
    }
    set({ isOpen: false, tourId: null, steps: [], currentStepIndex: 0 });
  },
}));