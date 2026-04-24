
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface PasswordResetEmailProps { name: string; resetLink: string; }

export const PasswordResetEmail = ({ name, resetLink }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Preview>Reset your MyTutorMe password — action required</Preview>
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

            {/* Main Card */}
            <Section style={{ backgroundColor: '#ffffff', padding: '40px 32px', textAlign: 'center' }}>
              
              {/* Lock icon */}
              <Section style={{ marginBottom: '24px' }}>
                <Section style={{ width: '72px', height: '72px', backgroundColor: '#fef3c7', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: '32px', margin: '0', lineHeight: '72px' }}>🔐</Text>
                </Section>
              </Section>

              <Text style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>
                Password Reset Request
              </Text>
              <Text style={{ fontSize: '15px', color: '#64748b', margin: '0 0 28px', lineHeight: '1.6', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                Hi {name}, we received a request to reset your MyTutorMe password. Click the button below to create a new password.
              </Text>

              <Button
                href={resetLink}
                style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: '700', padding: '14px 40px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontFamily: 'Manrope, sans-serif', marginBottom: '24px' }}
              >
                Reset My Password
              </Button>

              {/* Security notice */}
              <Section style={{ backgroundColor: '#fef9f0', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px 20px', margin: '0 0 16px', textAlign: 'left' }}>
                <Text style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>⚠️ Security Notice</Text>
                <Text style={{ fontSize: '12px', color: '#78350f', margin: '0', lineHeight: '1.5' }}>
                  This link expires in <strong>1 hour</strong>. If you did not request this reset, your account is safe — please ignore this email. Your password will not change.
                </Text>
              </Section>

              <Text style={{ fontSize: '12px', color: '#94a3b8', margin: '0' }}>
                Can't click the button? Copy and paste this link:<br />
                <Link href={resetLink} style={{ color: '#10B981', fontSize: '11px', wordBreak: 'break-all' }}>{resetLink}</Link>
              </Text>
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
                </Column>
              </Row>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
