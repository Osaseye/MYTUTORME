"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const EmailVerificationEmail = ({ name, verificationLink }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsxs)(components_1.Preview, { children: ["One tap to verify \u2014 then you're in, ", name, "."] }), (0, jsx_runtime_1.jsxs)(components_1.Tailwind, { config: {
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
                                }, fontWeight: 800 })] }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: { backgroundColor: '#0B1120', margin: '0', padding: '0', fontFamily: 'Inter, sans-serif' }, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: { textAlign: 'center', marginBottom: '32px' }, children: (0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsxs)(components_1.Column, { align: "center", children: [(0, jsx_runtime_1.jsx)(components_1.Img, { src: "https://www.mytutorme.org/icon.png", width: "44", height: "44", alt: "MyTutorMe", style: { borderRadius: '12px', display: 'inline-block' } }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: {
                                                        color: '#10B981',
                                                        fontSize: '18px',
                                                        fontWeight: '800',
                                                        margin: '8px 0 0',
                                                        fontFamily: 'Manrope, sans-serif',
                                                        letterSpacing: '-0.3px',
                                                    }, children: "MyTutorMe" })] }) }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: {
                                        backgroundColor: '#111827',
                                        borderRadius: '20px',
                                        border: '1px solid #1e293b',
                                        overflow: 'hidden',
                                    }, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: {
                                                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                                                height: '4px',
                                                padding: '0',
                                            }, children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: { margin: '0', fontSize: '0' }, children: " " }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: { padding: '48px 40px 40px' }, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: { marginBottom: '32px' }, children: (0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsx)(components_1.Column, { align: "center", children: (0, jsx_runtime_1.jsx)(components_1.Section, { style: {
                                                                    width: '72px',
                                                                    height: '72px',
                                                                    backgroundColor: 'rgba(16,185,129,0.12)',
                                                                    borderRadius: '20px',
                                                                    border: '1px solid rgba(16,185,129,0.25)',
                                                                    display: 'inline-block',
                                                                    textAlign: 'center',
                                                                }, children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: '32px', margin: '0', lineHeight: '72px' }, children: "\u2709\uFE0F" }) }) }) }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: {
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        color: '#10B981',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1.5px',
                                                        margin: '0 0 12px',
                                                        textAlign: 'center',
                                                        fontFamily: 'Manrope, sans-serif',
                                                    }, children: "Verify Your Email" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: {
                                                        fontSize: '30px',
                                                        fontWeight: '800',
                                                        color: '#f1f5f9',
                                                        margin: '0 0 16px',
                                                        lineHeight: '1.2',
                                                        textAlign: 'center',
                                                        fontFamily: 'Manrope, sans-serif',
                                                    }, children: ["Hi ", name, ", you're", (0, jsx_runtime_1.jsx)("br", {}), "almost there."] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: {
                                                        fontSize: '15px',
                                                        color: '#94a3b8',
                                                        margin: '0 0 36px',
                                                        lineHeight: '1.7',
                                                        textAlign: 'center',
                                                    }, children: ["Confirm your email address to unlock everything MyTutorMe has to offer \u2014 your AI tutor, mock exams, courses, and more. This link is valid for ", (0, jsx_runtime_1.jsx)("strong", { style: { color: '#e2e8f0' }, children: "24 hours" }), "."] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: { textAlign: 'center', marginBottom: '36px' }, children: (0, jsx_runtime_1.jsx)(components_1.Button, { href: verificationLink, style: {
                                                            backgroundColor: '#10B981',
                                                            color: '#ffffff',
                                                            fontSize: '16px',
                                                            fontWeight: '700',
                                                            padding: '16px 40px',
                                                            borderRadius: '12px',
                                                            textDecoration: 'none',
                                                            display: 'inline-block',
                                                            fontFamily: 'Manrope, sans-serif',
                                                            letterSpacing: '-0.2px',
                                                        }, children: "Verify My Email \u2192" }) }), (0, jsx_runtime_1.jsx)(components_1.Hr, { style: { borderColor: '#1e293b', margin: '0 0 28px' } }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: '12px', color: '#475569', textAlign: 'center', margin: '0 0 4px' }, children: "Button not working?" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: '11px', color: '#334155', textAlign: 'center', margin: '0', wordBreak: 'break-all' }, children: (0, jsx_runtime_1.jsx)(components_1.Link, { href: verificationLink, style: { color: '#10B981', textDecoration: 'underline' }, children: verificationLink }) })] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: {
                                                backgroundColor: '#0f172a',
                                                padding: '20px 40px',
                                                borderTop: '1px solid #1e293b',
                                            }, children: (0, jsx_runtime_1.jsxs)(components_1.Row, { children: [(0, jsx_runtime_1.jsx)(components_1.Column, { style: { width: '20px', verticalAlign: 'top', paddingTop: '1px' }, children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: { margin: '0', fontSize: '14px' }, children: "\uD83D\uDD12" }) }), (0, jsx_runtime_1.jsx)(components_1.Column, { style: { paddingLeft: '10px' }, children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: '12px', color: '#475569', margin: '0', lineHeight: '1.6' }, children: "Didn't create a MyTutorMe account? You can safely ignore this email \u2014 your address will not be used without your confirmation." }) })] }) })] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: { textAlign: 'center', padding: '28px 0 0' }, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: { color: '#1e293b', fontSize: '12px', margin: '0 0 10px' }, children: "\u00A9 2026 MyTutorMe \u00B7 All rights reserved." }), (0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsxs)(components_1.Column, { align: "center", children: [(0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://mytutorme.org/privacy", style: { color: '#334155', fontSize: '11px', textDecoration: 'underline', margin: '0 10px' }, children: "Privacy" }), (0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://mytutorme.org/terms", style: { color: '#334155', fontSize: '11px', textDecoration: 'underline', margin: '0 10px' }, children: "Terms" }), (0, jsx_runtime_1.jsx)(components_1.Link, { href: "mailto:support@mytutorme.org", style: { color: '#334155', fontSize: '11px', textDecoration: 'underline', margin: '0 10px' }, children: "Support" })] }) })] })] }) })] })] }));
};
exports.EmailVerificationEmail = EmailVerificationEmail;
//# sourceMappingURL=EmailVerificationEmail.js.map