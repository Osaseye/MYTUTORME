"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateAwardEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const CertificateAwardEmail = ({ studentName, courseTitle, certificateUrl, }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Congratulations on completing your course!" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Heading, { style: h1, children: "Course Completed\uD83C\uDF89" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["Hi ", studentName, ","] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["Amazing job! You have fully completed the course ", (0, jsx_runtime_1.jsx)("strong", { children: courseTitle }), ". All of that hard work has paid off, and your certificate of completion is now ready for you!"] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: btnContainer, children: (0, jsx_runtime_1.jsx)(components_1.Button, { style: button, href: certificateUrl, children: "View Your Certificate" }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: text, children: "Keep up the excellent learning momentum!" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["Best,", (0, jsx_runtime_1.jsx)("br", {}), "The MyTutorMe Team"] })] }) })] }));
};
exports.CertificateAwardEmail = CertificateAwardEmail;
const main = {
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '8px',
};
const h1 = {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '40px',
    margin: '0 0 20px',
    padding: '0 48px',
};
const text = {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '24px',
    padding: '0 48px',
};
const btnContainer = {
    padding: '20px 48px',
};
const button = {
    backgroundColor: '#059669',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '12px',
};
//# sourceMappingURL=CertificateAwardEmail.js.map