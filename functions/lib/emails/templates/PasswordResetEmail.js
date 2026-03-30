"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const PasswordResetEmail = ({ name, resetLink }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Reset your MyTutorMe password" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: header, children: (0, jsx_runtime_1.jsx)(components_1.Heading, { style: headerText, children: "Password Reset" }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: body, children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: ["Hi ", name, ","] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "We received a request to reset the password for your MyTutorMe account. If you did not request this, you can safely ignore this email." }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: buttonContainer, children: (0, jsx_runtime_1.jsx)(components_1.Link, { href: resetLink, style: button, children: "Reset Password" }) }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: ["Or copy and paste this URL into your browser: ", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)(components_1.Link, { href: resetLink, style: linkStyle, children: resetLink })] })] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footer, children: ["\u00A9 ", new Date().getFullYear(), " MyTutorMe. All rights reserved."] })] }) })] }));
};
exports.PasswordResetEmail = PasswordResetEmail;
const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const header = { padding: '0 48px', textAlign: 'center' };
const headerText = { color: '#333', fontSize: '24px', fontWeight: 'bold' };
const body = { padding: '0 48px' };
const paragraph = { color: '#555', fontSize: '16px', lineHeight: '24px' };
const buttonContainer = { margin: '24px 0', textAlign: 'center' };
const button = { backgroundColor: '#4f46e5', borderRadius: '4px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', width: '100%', padding: '12px' };
const linkStyle = { color: '#4f46e5', textDecoration: 'underline' };
const footer = { color: '#8898aa', fontSize: '12px', marginTop: '48px', textAlign: 'center' };
//# sourceMappingURL=PasswordResetEmail.js.map