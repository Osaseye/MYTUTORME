"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRejectionEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const CourseRejectionEmail = ({ teacherName, courseTitle, reason }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Update regarding your Course Application" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: header, children: (0, jsx_runtime_1.jsx)(components_1.Heading, { style: headerText, children: "Course Review Update" }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: body, children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: ["Hi ", teacherName, ","] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: ["Thank you for submitting ", (0, jsx_runtime_1.jsxs)("strong", { children: ["\"", courseTitle, "\""] }), " for review. Our team has reviewed your content, but unfortunately, we cannot publish it at this time."] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: reasonBox, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Feedback:" }), " ", reason] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "Please address the feedback provided above and submit the course for re-evaluation from your Teacher Dashboard." })] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footer, children: ["\u00A9 ", new Date().getFullYear(), " MyTutorMe. All rights reserved."] })] }) })] }));
};
exports.CourseRejectionEmail = CourseRejectionEmail;
const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const header = { padding: '0 48px', textAlign: 'center' };
const headerText = { color: '#333', fontSize: '24px', fontWeight: 'bold' };
const body = { padding: '0 48px' };
const paragraph = { color: '#555', fontSize: '16px', lineHeight: '24px' };
const reasonBox = { backgroundColor: '#fff3f3', padding: '16px', borderLeft: '4px solid #ef4444', color: '#555', fontSize: '15px' };
const footer = { color: '#8898aa', fontSize: '12px', marginTop: '48px', textAlign: 'center' };
//# sourceMappingURL=CourseRejectionEmail.js.map