
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface CourseApprovalEmailProps { teacherName: string; courseTitle: string; courseUrl: string; }

export const CourseApprovalEmail = ({ teacherName, courseTitle, courseUrl }: CourseApprovalEmailProps) => {
  return (
    <Html>
      <Preview>🎉 Your course "{courseTitle}" is now live on MyTutorMe!</Preview>
      <Tailwind config={{
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
                body: ['Inter', 'sans-serif'] 
              }
            }
          }
        }}>

        <Head>
          <Font fontFamily="Inter" fallbackFontFamily="sans-serif" webFont={{ url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeAmM.woff2", format: "woff2" }} fontWeight={400} />
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
            <Section style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', padding: '40px 32px 36px', textAlign: 'center', borderBottom: '1px solid #d1fae5' }}>
              <Text style={{ fontSize: '48px', margin: '0 0 16px' }}>🚀</Text>
              <Text style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', fontFamily: 'Manrope, sans-serif' }}>
                Your Course is Live!
              </Text>
              <Text style={{ fontSize: '15px', color: '#475569', margin: '0 0 24px', lineHeight: '1.6' }}>
                Congratulations, <strong>{teacherName}</strong>!<br />
                <strong>"{courseTitle}"</strong> has passed our review and is now available to students worldwide.
              </Text>
              <Button
                href={courseUrl}
                style={{ backgroundColor: '#10B981', color: '#ffffff', fontSize: '15px', fontWeight: '700', padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontFamily: 'Manrope, sans-serif' }}
              >
                View Your Course →
              </Button>
            </Section>

            {/* Tips */}
            <Section style={{ backgroundColor: '#ffffff', padding: '28px 32px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 14px', fontFamily: 'Manrope, sans-serif' }}>Maximize Your Course Impact</Text>
              {[
                { emoji: '📢', text: 'Share your course link with students and on social media.' },
                { emoji: '💬', text: 'Engage with student questions in the course community.' },
                { emoji: '📈', text: 'Track enrollments in your teacher dashboard.' },
              ].map((tip, i) => (
                <Row key={i} style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '36px', verticalAlign: 'top' }}>
                    <Text style={{ margin: '0', fontSize: '18px' }}>{tip.emoji}</Text>
                  </Column>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '1.5', paddingLeft: '8px' }}>{tip.text}</Text></Column>
                </Row>
              ))}
            </Section>

            {/* Footer */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '0 0 16px 16px', padding: '24px 32px', textAlign: 'center' }}>
              <Text style={{ color: '#10B981', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>MyTutorMe Intelligence</Text>
              <Text style={{ color: '#64748b', fontSize: '11px', margin: '0 0 12px' }}>© 2026 MyTutorMe Intelligence. All rights reserved.</Text>
              <Row>
                <Column align="center">
                  <Link href="https://mytutorme.org/privacy" style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'underline', margin: '0 8px' }}>Privacy Policy</Link>
                  <Link href="https://mytutorme.org/terms" style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'underline', margin: '0 8px' }}>Terms of Service</Link>
                </Column>
              </Row>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
