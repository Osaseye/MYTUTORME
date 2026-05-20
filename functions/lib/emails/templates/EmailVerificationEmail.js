"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const EmailVerificationEmail = ({ name, verificationLink }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Verify your email address to access MyTutorMe" }), (0, jsx_runtime_1.jsxs)(components_1.Tailwind, { config: {
                    theme: {
                        extend: {
                            colors: {
                                primary: '#10B981',
                                surface: '#f8fafc',
                                onSurface: '#0f172a',
                                onSurfaceVariant: '#475569',
                                outline: '#e2e8f0',
                            },
                            fontFamily: {
                                headline: ['Manrope', 'sans-serif'],
                                body: ['Inter', 'sans-serif'],
                            },
                        },
                    },
                }, children: [(0, jsx_runtime_1.jsxs)(components_1.Head, { children: [(0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Inter", fallbackFontFamily: "sans-serif", webFont: {
                                    url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeAmM.woff2',
                                    format: 'woff2',
                                }, fontWeight: 400 }), (0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Manrope", fallbackFontFamily: "sans-serif", webFont: {
                                    url: 'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2',
                                    format: 'woff2',
                                }, fontWeight: 700 }), (0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Manrope", fallbackFontFamily: "sans-serif", webFont: {
                                    url: 'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2',
                                    format: 'woff2',
                                }, fontWeight: 800 })] }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: { backgroundColor: '#f1f5f9', margin: '0', padding: '0', fontFamily: 'Inter, sans-serif' }, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: { maxWidth: '600px', margin: '32px auto', padding: '0' }, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: { backgroundColor: '#0f172a', borderRadius: '16px 16px 0 0', padding: '20px 32px' }, children: (0, jsx_runtime_1.jsxs)(components_1.Row, { children: [(0, jsx_runtime_1.jsx)(components_1.Column, { style: { width: '40px' }, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: "https://www.mytutorme.org/icon.png", width: "32", height: "32", alt: "MyTutorMe logo", style: { borderRadius: '8px' } }) }), (0, jsx_runtime_1.jsx)(components_1.Column, { children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: {
                                                        color: '#10B981',
                                                        fontSize: '20px',
                                                        fontWeight: '800',
                                                        margin: '0',
                                                        paddingLeft: '10px',
                                                        fontFamily: 'Manrope, sans-serif',
                                                    }, children: "MyTutorMe" }) }), (0, jsx_runtime_1.jsx)(components_1.Column, { align: "right", children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: {
                                                        color: '#64748b',
                                                        fontSize: '11px',
                                                        margin: '0',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px',
                                                    }, children: "Email Verification" }) })] }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: { backgroundColor: '#ffffff' }, children: [(0, jsx_runtime_1.jsxs)(components_1.Section, { style: {
                                                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #fffbeb 100%)',
                                                padding: '40px 32px 32px',
                                                borderBottom: '1px solid #e2e8f0',
                                            }, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: {
                                                        fontSize: '13px',
                                                        color: '#10B981',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1.5px',
                                                        margin: '0 0 12px',
                                                        fontFamily: 'Manrope, sans-serif',
                                                    }, children: "\u2709\uFE0F Verify Your Email" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: {
                                                        fontSize: '28px',
                                                        fontWeight: '800',
                                                        color: '#0f172a',
                                                        margin: '0 0 12px',
                                                        lineHeight: '1.2',
                                                        fontFamily: 'Manrope, sans-serif',
                                                    }, children: ["Hi ", name, ",", (0, jsx_runtime_1.jsx)("br", {}), "confirm your email address."] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: {
                                                        fontSize: '15px',
                                                        color: '#475569',
                                                        margin: '0 0 28px',
                                                        lineHeight: '1.6',
                                                    }, children: ["Click the button below to verify your email and unlock full access to MyTutorMe. This link expires in ", (0, jsx_runtime_1.jsx)("strong", { children: "24 hours" }), "."] }), (0, jsx_runtime_1.jsx)(components_1.Button, { href: verificationLink, style: {
                                                        backgroundColor: '#10B981',
                                                        color: '#ffffff',
                                                        fontSize: '15px',
                                                        fontWeight: '700',
                                                        padding: '14px 32px',
                                                        borderRadius: '10px',
                                                        textDecoration: 'none',
                                                        display: 'inline-block',
                                                        fontFamily: 'Manrope, sans-serif',
                                                    }, children: "Verify Email Address \u2192" })] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: { padding: '28px 32px' }, children: [(0, jsx_runtime_1.jsx)(components_1.Hr, { style: { borderColor: '#e2e8f0', margin: '0 0 24px' } }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: '13px', color: '#64748b', margin: '0', lineHeight: '1.6' }, children: "If you didn't create a MyTutorMe account, you can safely ignore this email. Your email address will not be used without verification." })] })] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: {
                                        backgroundColor: '#0f172a',
                                        borderRadius: '0 0 16px 16px',
                                        padding: '20px 32px',
                                    }, children: (0, jsx_runtime_1.jsxs)(components_1.Text, { style: { color: '#475569', fontSize: '12px', margin: '0', textAlign: 'center' }, children: ["\u00A9 2026 MyTutorMe \u00B7", ' ', (0, jsx_runtime_1.jsx)("a", { href: "https://mytutorme.org", style: { color: '#10B981', textDecoration: 'none' }, children: "mytutorme.org" })] }) })] }) })] })] }));
};
exports.EmailVerificationEmail = EmailVerificationEmail;
//# sourceMappingURL=EmailVerificationEmail.js.map