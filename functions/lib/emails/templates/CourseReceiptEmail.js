"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseReceiptEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const CourseReceiptEmail = ({ studentName, courseTitle, amount, transactionId, date, }) => {
    // Format amount as currency NGN
    const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsxs)(components_1.Preview, { children: ["Your receipt for ", courseTitle] }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Heading, { style: h1, children: "Payment Receipt" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["Hi ", studentName, ","] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["Thank you for your purchase! This email serves as your official receipt for the course ", (0, jsx_runtime_1.jsx)("strong", { children: courseTitle }), "."] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: receiptBox, children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { style: receiptText, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Date:" }), " ", date] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: receiptText, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Order ID:" }), " ", transactionId] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: receiptText, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Course:" }), " ", courseTitle] }), (0, jsx_runtime_1.jsx)(components_1.Hr, { style: divider }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: totalText, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Total Paid:" }), " ", formattedAmount] })] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: text, children: "You can now log in to your MyTutorMe dashboard and start learning immediately. If you have any questions or issues, please contact our support team." }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["Best,", (0, jsx_runtime_1.jsx)("br", {}), "The MyTutorMe Team"] })] }) })] }));
};
exports.CourseReceiptEmail = CourseReceiptEmail;
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
    marginBottom: '14px',
};
const receiptBox = {
    backgroundColor: '#f8fafc',
    padding: '20px',
    margin: '0 48px 24px',
    borderRadius: '6px',
};
const receiptText = {
    color: '#475569',
    fontSize: '14px',
    margin: '4px 0',
};
const totalText = {
    color: '#0f172a',
    fontSize: '16px',
    margin: '12px 0 0 0',
};
const divider = {
    borderColor: '#e2e8f0',
    margin: '12px 0',
};
//# sourceMappingURL=CourseReceiptEmail.js.map