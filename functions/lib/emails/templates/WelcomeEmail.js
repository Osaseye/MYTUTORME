"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const WelcomeEmail = ({ name, loginUrl }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Welcome to MyTutorMe!" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: header, children: (0, jsx_runtime_1.jsxs)(components_1.Heading, { style: headerText, children: ["Welcome, ", name, "!"] }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: body, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "We are absolutely thrilled to have you join MyTutorMe. Our platform is designed to give you the ultimate learning experience with powerful AI tools, mock exams, and premium content." }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "To get started, simply log into your account and explore the dashboard:" }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: buttonContainer, children: (0, jsx_runtime_1.jsx)(components_1.Link, { href: loginUrl, style: button, children: "Go to Dashboard" }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "If you have any questions, our support team is always here to help. Welcome to the future of learning!" })] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footer, children: ["\u00A9 ", new Date().getFullYear(), " MyTutorMe. All rights reserved."] })] }) })] }));
};
exports.WelcomeEmail = WelcomeEmail;
// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
};
const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};
const header = {
    padding: '0 48px',
    textAlign: 'center',
};
const headerText = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
};
const body = {
    padding: '0 48px',
};
const paragraph = {
    color: '#555',
    fontSize: '16px',
    lineHeight: '24px',
};
const buttonContainer = {
    margin: '24px 0',
    textAlign: 'center',
};
const button = {
    backgroundColor: '#4f46e5', // Primary theme color
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    width: '100%',
    padding: '12px',
};
const footer = {
    color: '#8898aa',
    fontSize: '12px',
    marginTop: '48px',
    textAlign: 'center',
};
//# sourceMappingURL=WelcomeEmail.js.map