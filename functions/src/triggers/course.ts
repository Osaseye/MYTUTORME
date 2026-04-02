import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import React from 'react';
import { sendEmail } from '../lib/email';
import { CourseApprovalEmail } from '../emails/templates/CourseApprovalEmail';
import { CourseRejectionEmail } from '../emails/templates/CourseRejectionEmail';
import { StudentEnrollmentEmail } from '../emails/templates/StudentEnrollmentEmail';

export const onCourseUpdated = functions.firestore
  .document('courses/{courseId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const courseId = context.params.courseId;

    // We only care if status changed
    if (before.status === after.status) return null;

    try {
      const teacherId = after.teacherId;
      if (!teacherId) return null;

      // Fetch teacher info
      const teacherDoc = await admin.firestore().collection('users').doc(teacherId).get();
      if (!teacherDoc.exists) return null;
      
      const teacherData = teacherDoc.data();
      if (!teacherData || !teacherData.email) return null;

      const teacherName = teacherData.displayName || 'Teacher';
      const email = teacherData.email;

      if (after.status === 'published' && before.status !== 'published') {
        // Course Approved
        await sendEmail({
          to: email,
          subject: `Your course "${after.title}" is now Live!`,
          react: React.createElement(CourseApprovalEmail, {
            teacherName,
            courseTitle: after.title || 'Your Course',
            courseUrl: `https://mytutorme.com/courses/${courseId}`,
          }),
        });
      } else if (after.status === 'rejected' && before.status !== 'rejected') {
        // Course Rejected
        await sendEmail({
          to: email,
          subject: `Action Required: Your course "${after.title}" review update`,
          react: React.createElement(CourseRejectionEmail, {
            teacherName,
            courseTitle: after.title || 'Your Course',
            reason: after.rejectionReason || 'Does not meet the quality guidelines required for our platform.',
          }),
        });
      }
    } catch (e) {
      console.error('Error sending course status email:', e);
    }

    return null;
  });

export const onEnrollmentCreated = functions.firestore
  .document('enrollments/{enrollmentId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    try {
      const studentDoc = await admin.firestore().collection('users').doc(data.studentId).get();
      const courseDoc = await admin.firestore().collection('courses').doc(data.courseId).get();
      
      if (!studentDoc.exists || !courseDoc.exists) return null;
      
      const studentData = studentDoc.data();
      const courseData = courseDoc.data();
      
      if (!studentData?.email) return null;
      
      const teacherDoc = await admin.firestore().collection('users').doc(courseData?.teacherId || '').get();
      const teacherName = teacherDoc.exists ? (teacherDoc.data()?.displayName || 'Instructor') : 'Your Instructor';
      
      await sendEmail({
        to: studentData.email,
        subject: `You are enrolled in ${courseData?.title || 'a new course'}!`,
        react: React.createElement(StudentEnrollmentEmail, {
          studentName: studentData.displayName || 'Student',
          courseTitle: courseData?.title || 'Your Course',
          courseUrl: `https://mytutorme.com/courses/${data.courseId}`,
          teacherName,
        }),
      });
    } catch (e) {
      console.error('Error sending enrollment email', e);
    }

    return null;
  });
