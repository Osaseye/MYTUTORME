import * as admin from "firebase-admin";

const db = admin.firestore();

export const getStudentProfile = async (uid: string): Promise<string> => {
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return "";
  const studentProfile = userDoc.data() || {};
  let profileContext = `The student's name is ${studentProfile.displayName || 'Unknown'}.`;
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

export const getEnrolledCourses = async (userId: string): Promise<string> => {
    const enrollmentsSnapshot = await db.collection("enrollments")
        .where("studentId", "==", userId)
        .limit(10)
        .get();
    if (enrollmentsSnapshot.empty) {
        return '';
    }

    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    if (courseIds.length === 0) return '';
    
    // We have to batch get courses or run multiple queries since 'in' max size is 10
    const validCourseIds = courseIds.slice(0, 10);
    const coursesSnapshot = await db.collection("courses")
        .where("__name__", "in", validCourseIds)
        .get();
        
    if (coursesSnapshot.empty) {
        return '';
    }

    const courseNames = coursesSnapshot.docs.map(doc => doc.data().title);
    return `The student is enrolled in the following courses: ${courseNames.join(', ')}.`;
}

export const getRecentAssignments = async (userId: string): Promise<string> => {
    const assignmentsSnapshot = await db.collection("assignments")
        .where('studentId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
    if (assignmentsSnapshot.empty) {
        return '';
    }
    const assignmentInfo = assignmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return `${data.title} (Subject: ${data.subject}, Status: ${data.status})`;
    });
    return `The student has the following recent assignments: ${assignmentInfo.join('; ')}.`;
}

export const getRecentMockExams = async (userId: string): Promise<string> => {
    const examsSnapshot = await db.collection("mock_exams")
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();
    if (examsSnapshot.empty) {
        return '';
    }
    const examInfo = examsSnapshot.docs.map(doc => {
        const data = doc.data();
        return `Exam on ${data.topic} (Score: ${data.score || 'not graded yet'})`;
    });
    return `The student has recently taken mock exams on these topics: ${examInfo.join('; ')}.`;
}

export const getAiTutorContext = async (uid: string): Promise<string> => {
  const profile = await getStudentProfile(uid);
  const courses = await getEnrolledCourses(uid);
  const assignments = await getRecentAssignments(uid);
  const exams = await getRecentMockExams(uid);

  const context = [profile, courses, assignments, exams].filter(Boolean).join('\n');
  return `Here is some context about the student you are tutoring:\n${context}`;
};