// @ts-nocheck
export const useTourStore = () => {
    return {
        startTour: (...args: any[]) => {}
    };
};

export interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: string;
}

export const TourStep = {}; // Dummy value export to satisfy isolated module runtime import errors

export const useTour = () => ({ startTour: () => {} });
