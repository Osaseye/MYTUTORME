"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRejectionEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const TeacherRejectionEmail = ({ name, reason }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Update regarding your Teacher Application" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: header, children: (0, jsx_runtime_1.jsx)(components_1.Heading, { style: headerText, children: "Update on Your Application" }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: body, children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: ["Hi ", name, ","] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "Thank you for applying to be a teacher on MyTutorMe. After careful review, we are currently unable to approve your application." }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: reasonBox, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Feedback:" }), " ", reason] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "We encourage you to resolve the issues above and feel free to reach out to our support team if you have any questions or when you are ready for a re-evaluation!" })] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footer, children: ["\u00A9 ", new Date().getFullYear(), " MyTutorMe. All rights reserved."] })] }) })] }));
};
exports.TeacherRejectionEmail = TeacherRejectionEmail;
const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const header = { padding: '0 48px', textAlign: 'center' };
const headerText = { color: '#333', fontSize: '24px', fontWeight: 'bold' };
const body = { padding: '0 48px' };
const paragraph = { color: '#555', fontSize: '16px', lineHeight: '24px' };
const reasonBox = { backgroundColor: '#fff3f3', padding: '16px', borderLeft: '4px solid #ef4444', color: '#555', fontSize: '15px' };
const footer = { color: '#8898aa', fontSize: '12px', marginTop: '48px', textAlign: 'center' };
//# sourceMappingURL=TeacherRejectionEmail.js.map