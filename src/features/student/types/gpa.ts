export type GradeScaleType = '4.0' | '5.0';

export interface GradePoint {
  grade: string;
  points: number;
}

export const SCALE_4_0: GradePoint[] = [
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.7 },
  { grade: 'B+', points: 3.3 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.7 },
  { grade: 'C+', points: 2.3 },
  { grade: 'C', points: 2.0 },
  { grade: 'C-', points: 1.7 },
  { grade: 'D+', points: 1.3 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0.0 },
];

export const SCALE_5_0: GradePoint[] = [
  { grade: 'A', points: 5.0 },
  { grade: 'B', points: 4.0 },
  { grade: 'C', points: 3.0 },
  { grade: 'D', points: 2.0 },
  { grade: 'E', points: 1.0 },
  { grade: 'F', points: 0.0 },
];

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  isCompleted: boolean;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}
