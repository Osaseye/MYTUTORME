
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface StudentEnrollmentEmailProps { studentName: string; courseTitle: string; courseUrl: string; teacherName: string; }

export const StudentEnrollmentEmail = ({ studentName, courseTitle, courseUrl, teacherName }: StudentEnrollmentEmailProps) => {
  return (
    <Html>
      <Preview>🎉 You're enrolled in {courseTitle}! Start learning now.</Preview>
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

            {/* Header */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '16px 16px 0 0', padding: '20px 32px' }}>
              <Row>
                <Column style={{ width: '40px' }}>
                  <Img src="https://www.mytutorme.org/icon.png" width="32" height="32" alt="MyTutorMe logo" style={{ borderRadius: '8px' }} />
                </Column>
                <Column>
                  <Text style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', margin: '0', paddingLeft: '10px', fontFamily: 'Manrope, sans-serif' }}>MyTutorMe</Text>
                </Column>
              </Row>
            </Section>

            {/* Hero */}
            <Section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '40px 32px 36px', position: 'relative' }}>
              <Text style={{ fontSize: '13px', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 12px', fontFamily: 'Manrope, sans-serif' }}>Enrollment Confirmed 🎉</Text>
              <Text style={{ fontSize: '30px', fontWeight: '800', color: '#ffffff', margin: '0 0 10px', lineHeight: '1.2', fontFamily: 'Manrope, sans-serif' }}>
                You're In, {studentName}!
              </Text>
              <Text style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
                You're officially enrolled in <strong style={{ color: '#ffffff' }}>{courseTitle}</strong> taught by <strong style={{ color: '#10B981' }}>{teacherName}</strong>.
              </Text>
              <Button
                href={courseUrl}
                style={{ backgroundColor: '#10B981', color: '#ffffff', fontSize: '15px', fontWeight: '700', padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontFamily: 'Manrope, sans-serif' }}
              >
                Start Learning Now →
              </Button>
            </Section>

            {/* Course detail card */}
            <Section style={{ backgroundColor: '#ffffff', padding: '28px 32px' }}>
              <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
                <Text style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Enrolled Course</Text>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>{courseTitle}</Text>
                <Text style={{ fontSize: '13px', color: '#475569', margin: '0' }}>Instructor: {teacherName}</Text>
              </Section>

              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px', fontFamily: 'Manrope, sans-serif' }}>Tips for Success</Text>
              
              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '36px', verticalAlign: 'top' }}>
                  <Section style={{ width: '28px', height: '28px', backgroundColor: '#ecfdf5', borderRadius: '50%', textAlign: 'center' }}>
                    <Text style={{ margin: '0', fontSize: '14px', lineHeight: '28px' }}>📅</Text>
                  </Section>
                </Column>
                <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '1.5', paddingLeft: '8px' }}>Schedule consistent study blocks in your calendar to stay on track.</Text></Column>
              </Row>
              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '36px', verticalAlign: 'top' }}>
                  <Section style={{ width: '28px', height: '28px', backgroundColor: '#ecfdf5', borderRadius: '50%', textAlign: 'center' }}>
                    <Text style={{ margin: '0', fontSize: '14px', lineHeight: '28px' }}>🤖</Text>
                  </Section>
                </Column>
                <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '1.5', paddingLeft: '8px' }}>Leverage the 24/7 AI Tutor when you encounter challenging concepts.</Text></Column>
              </Row>
              <Row>
                <Column style={{ width: '36px', verticalAlign: 'top' }}>
                  <Section style={{ width: '28px', height: '28px', backgroundColor: '#ecfdf5', borderRadius: '50%', textAlign: 'center' }}>
                    <Text style={{ margin: '0', fontSize: '14px', lineHeight: '28px' }}>💬</Text>
                  </Section>
                </Column>
                <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '1.5', paddingLeft: '8px' }}>Engage with your fellow students in the community forum.</Text></Column>
              </Row>
            </Section>

            {/* Footer */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '0 0 16px 16px', padding: '24px 32px', textAlign: 'center' }}>
              <Text style={{ color: '#10B981', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>MyTutorMe Intelligence</Text>
              <Text style={{ color: '#64748b', fontSize: '11px', margin: '0 0 12px', lineHeight: '1.5' }}>
                © 2026 MyTutorMe Intelligence. All rights reserved.
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
