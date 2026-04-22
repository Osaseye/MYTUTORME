import * as React from 'react';
import { cn } from '@/lib/utils';
// Custom Branded SVG Icons for MyTutorMe

// 1. The Nova AI Tutor Icon (The Hero)
// Replaced to use the official 3D Nova PNG from the public folder.
export const NovaIcon = ({ className, ...props }: any) => (
  <img 
    src="/nova.png" 
    alt="Nova AI Tutor"
    className={cn("w-full h-full object-contain object-center", className)} 
    {...props}
  />
);

// 2. Hub / Dashboard Icon (Home Style as Requested)
export const HubIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={cn("w-6 h-6", className)} 
    {...props}
  >
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
  </svg>
);

// 3. Compass / Explore (Used for Courses - Book icon style)
export const ExploreIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={cn("w-6 h-6", className)} 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

// 4. Stacks / Library (Not typically used now if replaced by above, but keeping for safety)
export const StacksIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={cn("w-6 h-6", className)} 
    {...props}
  >
    <rect x="4" y="4" width="16" height="4" rx="1" strokeWidth="2" />
    <rect x="4" y="10" width="16" height="4" rx="1" strokeWidth="2" />
    <rect x="4" y="16" width="16" height="4" rx="1" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" d="M8 4V8M16 4V8M8 10V14M16 10V14M8 16V20M16 16V20" opacity="0.4" />
  </svg>
);

// 5. Target / Exam Prep
export const TargetIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={cn("w-6 h-6", className)} 
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 6. Community / Nexus icon
export const NexusIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={cn("w-6 h-6", className)} 
    {...props}
  >
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);