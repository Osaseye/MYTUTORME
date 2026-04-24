
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column, Hr } from '@react-email/components';

interface WelcomeEmailProps { name: string; role: 'student' | 'teacher' | 'admin'; }

export const WelcomeEmailTemplate = ({ name, role }: WelcomeEmailProps) => {
  const dashboardUrl = role === 'teacher' ? 'https://mytutorme.org/teacher/dashboard' : role === 'admin' ? 'https://mytutorme.org/admin/dashboard' : 'https://mytutorme.org/student/dashboard';
  const roleLabel = role === 'teacher' ? 'Teacher' : role === 'admin' ? 'Admin' : 'Student';
  
  return (
    <Html>
      <Preview>Welcome to MyTutorMe, {name}! Your AI-First Journey to Academic Excellence Starts Now.</Preview>
      <Tailwind config={{
          theme: {
            extend: {
              colors: { 
                primary: '#10B981', 
                surface: '#f8fafc', 
                onSurface: '#0f172a', 
                onSurfaceVariant: '#475569', 
                outline: '#e2e8f0',
                error: '#ef4444' 
              },
              fontFamily: { 
                headline: ['Manrope', 'sans-serif'], 
                body: ['Inter', 'sans-serif'] 
              }
            }
          }
        }}>

        <Head>
          <Font fontFamily="Inter" fallbackFontFamily="sans-serif" webFont={{ url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeAmM.woff2", format: "woff2" }} fontWeight={400} />
          <Font fontFamily="Manrope" fallbackFontFamily="sans-serif" webFont={{ url: "https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2", format: "woff2" }} fontWeight={700} />
          <Font fontFamily="Manrope" fallbackFontFamily="sans-serif" webFont={{ url: "https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2", format: "woff2" }} fontWeight={800} />
        </Head>
        <Body style={{ backgroundColor: '#f1f5f9', margin: '0', padding: '0', fontFamily: 'Inter, sans-serif' }}>
          <Container style={{ maxWidth: '600px', margin: '32px auto', padding: '0' }}>

            {/* Header Bar */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '16px 16px 0 0', padding: '20px 32px' }}>
              <Row>
                <Column style={{ width: '40px' }}>
                  <Img src="https://www.mytutorme.org/icon.png" width="32" height="32" alt="MyTutorMe logo" style={{ borderRadius: '8px' }} />
                </Column>
                <Column>
                  <Text style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', margin: '0', paddingLeft: '10px', fontFamily: 'Manrope, sans-serif' }}>MyTutorMe</Text>
                </Column>
                <Column align="right">
                  <Text style={{ color: '#64748b', fontSize: '11px', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>{roleLabel} Account</Text>
                </Column>
              </Row>
            </Section>

            {/* Main Card */}
            <Section style={{ backgroundColor: '#ffffff', padding: '0' }}>

              {/* Hero gradient section */}
              <Section style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #fffbeb 100%)', padding: '40px 32px 32px', borderBottom: '1px solid #e2e8f0' }}>
                <Text style={{ fontSize: '13px', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 12px', fontFamily: 'Manrope, sans-serif' }}>
                  🎉 Welcome Aboard
                </Text>
                <Text style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px', lineHeight: '1.2', fontFamily: 'Manrope, sans-serif' }}>
                  Hello, {name}!<br />Your journey starts here.
                </Text>
                <Text style={{ fontSize: '16px', color: '#475569', margin: '0 0 28px', lineHeight: '1.6' }}>
                  Experience a new era of learning with your own 24/7 AI Tutor — designed to accelerate your understanding and help you achieve your academic goals.
                </Text>
                <Button
                  href={dashboardUrl}
                  style={{ backgroundColor: '#10B981', color: '#ffffff', fontSize: '15px', fontWeight: '700', padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontFamily: 'Manrope, sans-serif' }}
                >
                  Go to Dashboard →
                </Button>
              </Section>

              {/* Features Grid */}
              <Section style={{ padding: '32px 32px 8px' }}>
                <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px', fontFamily: 'Manrope, sans-serif' }}>What You Can Do</Text>
                <Row style={{ marginBottom: '16px' }}>
                  <Column style={{ width: '48%', paddingRight: '8px', verticalAlign: 'top' }}>
                    <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <Text style={{ fontSize: '22px', margin: '0 0 6px' }}>🤖</Text>
                      <Text style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>AI Tutor</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b', margin: '0', lineHeight: '1.5' }}>Get instant answers to any academic question, 24/7.</Text>
                    </Section>
                  </Column>
                  <Column style={{ width: '48%', paddingLeft: '8px', verticalAlign: 'top' }}>
                    <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <Text style={{ fontSize: '22px', margin: '0 0 6px' }}>📝</Text>
                      <Text style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>Mock Exams</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b', margin: '0', lineHeight: '1.5' }}>Practice with AI-generated exams and track progress.</Text>
                    </Section>
                  </Column>
                </Row>
                <Row style={{ marginBottom: '16px' }}>
                  <Column style={{ width: '48%', paddingRight: '8px', verticalAlign: 'top' }}>
                    <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <Text style={{ fontSize: '22px', margin: '0 0 6px' }}>🃏</Text>
                      <Text style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>Flashcards</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b', margin: '0', lineHeight: '1.5' }}>Master concepts with smart, AI-generated flashcards.</Text>
                    </Section>
                  </Column>
                  <Column style={{ width: '48%', paddingLeft: '8px', verticalAlign: 'top' }}>
                    <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <Text style={{ fontSize: '22px', margin: '0 0 6px' }}>📊</Text>
                      <Text style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>GPA Tracker</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b', margin: '0', lineHeight: '1.5' }}>Monitor your academic performance over time.</Text>
                    </Section>
                  </Column>
                </Row>
              </Section>

              {/* Getting Started */}
              <Section style={{ margin: '0 32px 32px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px' }}>
                <Text style={{ fontSize: '15px', fontWeight: '700', color: '#10B981', margin: '0 0 16px', fontFamily: 'Manrope, sans-serif' }}>✅ Getting Started Checklist</Text>
                <Row style={{ marginBottom: '10px' }}>
                  <Column style={{ width: '28px', verticalAlign: 'top' }}>
                    <Section style={{ width: '20px', height: '20px', backgroundColor: '#10B981', borderRadius: '4px', textAlign: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0', lineHeight: '20px' }}>✓</Text>
                    </Section>
                  </Column>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '20px' }}>Verify your email address</Text></Column>
                </Row>
                <Row style={{ marginBottom: '10px' }}>
                  <Column style={{ width: '28px', verticalAlign: 'top' }}>
                    <Section style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderRadius: '4px' }}><Text style={{ margin: '0' }}></Text></Section>
                  </Column>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '20px' }}>Complete your profile and set your goals</Text></Column>
                </Row>
                <Row>
                  <Column style={{ width: '28px', verticalAlign: 'top' }}>
                    <Section style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderRadius: '4px' }}><Text style={{ margin: '0' }}></Text></Section>
                  </Column>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '20px' }}>Start your first AI Tutor session</Text></Column>
                </Row>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '0 0 16px 16px', padding: '24px 32px', textAlign: 'center' }}>
              <Text style={{ color: '#10B981', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>MyTutorMe Intelligence</Text>
              <Text style={{ color: '#64748b', fontSize: '11px', margin: '0 0 12px', lineHeight: '1.5' }}>
                © 2026 MyTutorMe Intelligence. All rights reserved.<br />
                Democratizing elite education through AI.
              </Text>
              <Row>
                <Column align="center">
                  <Link href="https://mytutorme.org/privacy" style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'underline', margin: '0 8px' }}>Privacy Policy</Link>
                  <Link href="https://mytutorme.org/terms" style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'underline', margin: '0 8px' }}>Terms of Service</Link>
                  <Link href="#" style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'underline', margin: '0 8px' }}>Unsubscribe</Link>
                </Column>
              </Row>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
