import { SCALE_4_0, SCALE_5_0 } from '../types/gpa';
import type { Course, GradeScaleType } from '../types/gpa';

export const getGradePoints = (grade: string, scale: GradeScaleType = '4.0'): number => {
  const pointsMap = scale === '4.0' ? SCALE_4_0 : SCALE_5_0;
  const gradeEntry = pointsMap.find((g) => g.grade === grade);
  return gradeEntry ? gradeEntry.points : 0;
};

export const calculateSemesterGPA = (courses: Course[], scale: GradeScaleType = '4.0'): number => {
  const completedCourses = courses.filter((c) => c.grade !== '');
  
  if (completedCourses.length === 0) return 0;

  const totalPoints = completedCourses.reduce((sum, course) => {
    return sum + (getGradePoints(course.grade, scale) * course.credits);
  }, 0);

  const totalCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0);

  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
};

export const calculateCumulativeGPA = (semesters: { courses: Course[] }[], scale: GradeScaleType = '4.0'): number => {
  const allCourses = semesters.flatMap((s) => s.courses).filter((c) => c.grade !== '');

  if (allCourses.length === 0) return 0;

  const totalPoints = allCourses.reduce((sum, course) => {
    return sum + (getGradePoints(course.grade, scale) * course.credits);
  }, 0);

  const totalCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);

  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
};

export const calculateRequiredGPA = (
  currentGPA: number,
  currentCredits: number,
  targetGPA: number,
  remainingCredits: number
): number | null => {
  // Target GPA = ( (Current GPA * Current Credits) + (Required GPA * Remaining Credits) ) / (Current Credits + Remaining Credits)
  // Required GPA * Remaining Credits = (Target GPA * Total Credits) - (Current GPA * Current Credits)
  // Required GPA = ( (Target GPA * (Current Credits + Remaining Credits)) - (Current GPA * Current Credits) ) / Remaining Credits

  if (remainingCredits <= 0) return null;

  const totalCredits = currentCredits + remainingCredits;
  const requiredPoints = (targetGPA * totalCredits) - (currentGPA * currentCredits);
  const requiredGPA = requiredPoints / remainingCredits;

  return Number(requiredGPA.toFixed(2));
};
