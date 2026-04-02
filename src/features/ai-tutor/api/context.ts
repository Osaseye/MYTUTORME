import { db } from '@/lib/firebase';
import type { User, StudentProfile } from '@/types/user';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const getStudentProfile = async (user: User): Promise<string> => {
  const studentProfile = user as StudentProfile;
  let profileContext = `The student's name is ${studentProfile.displayName}.`;
  if (studentProfile.institution) {
    profileContext += ` They study at ${studentProfile.institution}`;
    if (studentProfile.courseOfStudy) {
      profileContext += ` and their course of study is ${studentProfile.courseOfStudy}.`;
    }
  }
  if (studentProfile.interests) {
    profileContext += ` Their interests include: ${studentProfile.interests.join(', ')}.`;
  }
  if (studentProfile.painPoint) {
    profileContext += ` Their main pain point with their studies is: ${studentProfile.painPoint}.`;
  }
  if (studentProfile.currentCGPA) {
    profileContext += ` Their current CGPA is ${studentProfile.currentCGPA} out of ${studentProfile.gradingSystem}.`;
    if (studentProfile.targetCGPA) {
      profileContext += ` Their target CGPA is ${studentProfile.targetCGPA}.`;
    }
  }
  return profileContext;
};

const getEnrolledCourses = async (userId: string): Promise<string> => {
    const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        limit(10)
    );
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    if (enrollmentsSnapshot.empty) {
        return '';
    }

    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    const coursesQuery = query(collection(db, 'courses'), where('__name__', 'in', courseIds));
    const coursesSnapshot = await getDocs(coursesQuery);
    if (coursesSnapshot.empty) {
        return '';
    }

    const courseNames = coursesSnapshot.docs.map(doc => doc.data().title);
    return `The student is enrolled in the following courses: ${courseNames.join(', ')}.`;
}

const getRecentAssignments = async (userId: string): Promise<string> => {
    const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('studentId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    if (assignmentsSnapshot.empty) {
        return '';
    }
    const assignmentInfo = assignmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return `${data.title} (Subject: ${data.subject}, Status: ${data.status})`;
    });
    return `The student has the following recent assignments: ${assignmentInfo.join('; ')}.`;
}

const getRecentMockExams = async (userId: string): Promise<string> => {
    const examsQuery = query(
        collection(db, 'mock_exams'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(3)
    );
    const examsSnapshot = await getDocs(examsQuery);
    if (examsSnapshot.empty) {
        return '';
    }
    const examInfo = examsSnapshot.docs.map(doc => {
        const data = doc.data();
        return `Exam on ${data.topic} (Score: ${data.score || 'not graded yet'})`;
    });
    return `The student has recently taken mock exams on these topics: ${examInfo.join('; ')}.`;
}

export const getAiTutorContext = async (user: User): Promise<string> => {
  if (!user) return '';

  const profile = await getStudentProfile(user);
  const courses = await getEnrolledCourses(user.uid);
  const assignments = await getRecentAssignments(user.uid);
  const exams = await getRecentMockExams(user.uid);

  const context = [profile, courses, assignments, exams].filter(Boolean).join('\n');
  return `Here is some context about the student you are tutoring:\n${context}`;
};
