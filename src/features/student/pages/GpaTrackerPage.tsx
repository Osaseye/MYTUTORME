import { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Target, 
  TrendingUp, 
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { 
  SCALE_4_0, 
  SCALE_5_0 
} from '../types/gpa';
import type { 
  Course, 
  Semester, 
  GradeScaleType
} from '../types/gpa';
import { 
  calculateSemesterGPA, 
  calculateCumulativeGPA, 
  calculateRequiredGPA,
  getGradePoints
} from '../utils/gpaUtils';

export const GpaTrackerPage = () => {
  // State
  const [scale, setScale] = useState<GradeScaleType>('4.0');
  const [targetGPA, setTargetGPA] = useState<number>(3.5);
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: '1',
      name: 'Semester 1',
      courses: [
        { id: '1', name: 'Mathematics 101', credits: 3, grade: 'A', isCompleted: true },
        { id: '2', name: 'Physics 101', credits: 4, grade: 'B+', isCompleted: true },
      ]
    }
  ]);
  const [predictionCourses, setPredictionCourses] = useState<Course[]>([
    { id: 'p1', name: 'Hypothetical Course 1', credits: 3, grade: 'A', isCompleted: false },
    { id: 'p2', name: 'Hypothetical Course 2', credits: 3, grade: 'B', isCompleted: false },
  ]);

  // Derived State
  const currentGPA = calculateCumulativeGPA(semesters, scale);
  const totalCreditsEarned = semesters.flatMap(s => s.courses).reduce((sum, c) => sum + c.credits, 0);
  
  const activeScale = scale === '4.0' ? SCALE_4_0 : SCALE_5_0;

  // Prediction Logic
  const predictionCredits = predictionCourses.reduce((sum, c) => sum + c.credits, 0);
  const predictionPoints = predictionCourses.reduce((sum, c) => sum + (getGradePoints(c.grade, scale) * c.credits), 0);
  
  const currentTotalPoints = semesters.flatMap(s => s.courses).reduce((sum, c) => sum + (getGradePoints(c.grade, scale) * c.credits), 0);
  
  const projectedTotalPoints = currentTotalPoints + predictionPoints;
  const projectedTotalCredits = totalCreditsEarned + predictionCredits;
  const projectedGPA = projectedTotalCredits > 0 ? (projectedTotalPoints / projectedTotalCredits) : 0;

  // Handlers
  const addSemester = () => {
    const newId = (semesters.length + 1).toString();
    setSemesters([...semesters, { id: newId, name: `Semester ${newId}`, courses: [] }]);
  };

  const addCourseToSemester = (semesterId: string) => {
    const updatedSemesters = semesters.map(sem => {
      if (sem.id === semesterId) {
        return {
          ...sem,
          courses: [...sem.courses, { 
            id: Date.now().toString(), 
            name: 'New Course', 
            credits: 3, 
            grade: 'B', 
            isCompleted: true 
          }]
        };
      }
      return sem;
    });
    setSemesters(updatedSemesters);
  };

  const updateCourse = (semesterId: string, courseId: string, field: keyof Course, value: any) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semesterId) {
        return {
          ...sem,
          courses: sem.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
        };
      }
      return sem;
    }));
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semesterId) {
        return { ...sem, courses: sem.courses.filter(c => c.id !== courseId) };
      }
      return sem;
    }));
  };

  const addPredictionCourse = () => {
    setPredictionCourses([...predictionCourses, {
      id: Date.now().toString(),
      name: `Hypothetical Course ${predictionCourses.length + 1}`,
      credits: 3,
      grade: 'A',
      isCompleted: false
    }]);
  };

  const updatePredictionCourse = (id: string, field: keyof Course, value: any) => {
    setPredictionCourses(predictionCourses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removePredictionCourse = (id: string) => {
    setPredictionCourses(predictionCourses.filter(c => c.id !== id));
  };

  // Required GPA Calculation for "What If"
  const remainingCreditsForTarget = 15; // Assumption for now, or could vary
  const requiredGPAForTarget = calculateRequiredGPA(currentGPA, totalCreditsEarned, targetGPA, remainingCreditsForTarget);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">GPA Tracker & Predictor</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your academic progress and simulate future scenarios.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">Grading Scale:</span>
          <select 
            value={scale} 
            onChange={(e) => setScale(e.target.value as GradeScaleType)}
            className="bg-gray-100 dark:bg-slate-800 border-none rounded-md text-sm focus:ring-2 focus:ring-primary py-1.5 pl-3 pr-8"
          >
            <option value="4.0">4.0 Scale</option>
            <option value="5.0">5.0 Scale</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current GPA Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <GraduationCap className="w-24 h-24 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current GPA</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{currentGPA.toFixed(2)}</span>
            <span className="text-sm text-gray-500">/ {scale}</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
             <BookOpen className="w-4 h-4" />
             <span>{totalCreditsEarned} Credits Earned</span>
          </div>
        </div>

        {/* Target GPA Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
           <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Target GPA</h3>
              <Target className="w-5 h-5 text-primary" />
           </div>
           
           <div className="flex items-center gap-3 mb-4">
              <input 
                type="number" 
                value={targetGPA}
                onChange={(e) => setTargetGPA(parseFloat(e.target.value))}
                step="0.1"
                min="0"
                max={scale}
                className="text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary/20 focus:border-primary focus:outline-none w-24"
              />
              <span className="text-sm text-gray-500">/ {scale}</span>
           </div>
           
           {requiredGPAForTarget && requiredGPAForTarget <= parseFloat(scale) ? (
             <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/20">
               Need avg <strong>{requiredGPAForTarget}</strong> in next 15 credits
             </div>
           ) : (
             <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 p-2 rounded-lg border border-orange-100 dark:border-orange-900/20 flex items-center gap-2">
               <AlertCircle className="w-4 h-4" />
               <span>Target may be unreachable soon</span>
             </div>
           )}
        </div>

        {/* Projected GPA Card */}
        <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-xl p-6 shadow-sm border border-primary/20 dark:border-primary/20">
           <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-medium text-primary dark:text-primary-foreground">Projected GPA</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
           </div>
           <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Based on simulated courses below</p>
           
           <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${projectedGPA >= currentGPA ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {projectedGPA.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">/ {scale}</span>
          </div>

          <div className="mt-4 text-sm">
             {projectedGPA > currentGPA ? (
                <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{(projectedGPA - currentGPA).toFixed(2)} boost
                </span>
             ) : (
                <span className="text-gray-500">No change or decrease</span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Course History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Course History
            </h2>
            <button 
              onClick={addSemester}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Semester
            </button>
          </div>

          <div className="space-y-4">
            {semesters.map((semester) => (
              <div key={semester.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                   <h3 className="font-semibold text-gray-900 dark:text-white">{semester.name}</h3>
                   <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded text-gray-600 dark:text-gray-300">
                     GPA: {calculateSemesterGPA(semester.courses, scale).toFixed(2)}
                   </span>
                </div>
                
                <div className="p-4 space-y-3">
                   {semester.courses.map((course) => (
                     <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                           <input 
                              type="text" 
                              value={course.name}
                              onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                              className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-slate-800"
                              placeholder="Course Name"
                           />
                        </div>
                        <div className="col-span-2">
                           <input 
                              type="number" 
                              value={course.credits}
                              onChange={(e) => updateCourse(semester.id, course.id, 'credits', parseFloat(e.target.value))}
                              className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-slate-800 text-center"
                              placeholder="Cr"
                           />
                        </div>
                        <div className="col-span-3">
                           <select 
                              value={course.grade}
                              onChange={(e) => updateCourse(semester.id, course.id, 'grade', e.target.value)}
                              className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-slate-800"
                           >
                             {activeScale.map(g => (
                               <option key={g.grade} value={g.grade}>{g.grade} ({g.points})</option>
                             ))}
                           </select>
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <button onClick={() => removeCourse(semester.id, course.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}
                   <button 
                     onClick={() => addCourseToSemester(semester.id)}
                     className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                   >
                     <Plus className="w-4 h-4" /> Add Course
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Predictive Tools */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
             <Calculator className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">"What If" Simulator</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-primary/20 dark:border-primary/20 p-6">
             <div className="mb-6 flex justify-between items-center">
               <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Simulate Upcoming Semester</h3>
                  <p className="text-sm text-gray-500">Add hypothetical courses to see how they impact your CGPA.</p>
               </div>
               <button 
                  onClick={() => { setPredictionCourses([]); }}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
               >
                 <RotateCcw className="w-3 h-3" /> Reset
               </button>
             </div>

             <div className="space-y-3 mb-6">
                {predictionCourses.map((course) => (
                  <div key={course.id} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
                     <div className="flex-grow">
                        <input 
                           type="text" 
                           value={course.name}
                           onChange={(e) => updatePredictionCourse(course.id, 'name', e.target.value)}
                           className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400"
                           placeholder="Course Name"
                        />
                     </div>
                     <div className="w-16">
                        <input 
                           type="number" 
                           value={course.credits}
                           onChange={(e) => updatePredictionCourse(course.id, 'credits', parseFloat(e.target.value))}
                           className="w-full text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-center"
                        />
                     </div>
                     <div className="w-24">
                        <select 
                           value={course.grade}
                           onChange={(e) => updatePredictionCourse(course.id, 'grade', e.target.value)}
                           className="w-full text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:ring-primary focus:border-primary"
                        >
                          {activeScale.map(g => (
                            <option key={g.grade} value={g.grade}>{g.grade}</option>
                          ))}
                        </select>
                     </div>
                     <button onClick={() => removePredictionCourse(course.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                ))}
                
                <button 
                  onClick={addPredictionCourse}
                  className="w-full py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-sm font-medium transition-colors border border-primary/10 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Hypothetical Course
                </button>
             </div>

             <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Simulated Outcome</h4>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-600 dark:text-gray-400">Total Simulated Credits:</span>
                   <span className="font-bold text-gray-900 dark:text-white">{predictionCredits}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                   <span className="text-gray-600 dark:text-gray-400">Semester GPA:</span>
                   <span className="font-bold text-primary">{calculateSemesterGPA(predictionCourses, scale).toFixed(2)}</span>
                </div>
             </div>
          </div>
        
          {/* Helper Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20">
             <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                Quick Tip
             </h3>
             <p className="text-sm text-blue-700 dark:text-blue-400">
                To reach your target of <strong>{targetGPA}</strong>, try adjusting the grades in the "What If" simulator. 
                Focus on high-credit courses as they have a larger impact on your GPA.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};
