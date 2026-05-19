import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Font,
  Tailwind,
  Row,
  Column,
  Hr,
} from '@react-email/components';

interface EmailVerificationEmailProps {
  name: string;
  verificationLink: string;
}

export const EmailVerificationEmail = ({ name, verificationLink }: EmailVerificationEmailProps) => {
  return (
    <Html>
      <Preview>Verify your email address to access MyTutorMe</Preview>
      <Tailwind
        config={{
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
        }}
      >
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeAmM.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
          />
          <Font
            fontFamily="Manrope"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2',
              format: 'woff2',
            }}
            fontWeight={700}
          />
          <Font
            fontFamily="Manrope"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2',
              format: 'woff2',
            }}
            fontWeight={800}
          />
        </Head>

        <Body style={{ backgroundColor: '#f1f5f9', margin: '0', padding: '0', fontFamily: 'Inter, sans-serif' }}>
          <Container style={{ maxWidth: '600px', margin: '32px auto', padding: '0' }}>

            {/* Header Bar */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '16px 16px 0 0', padding: '20px 32px' }}>
              <Row>
                <Column style={{ width: '40px' }}>
                  <Img
                    src="https://www.mytutorme.org/icon.png"
                    width="32"
                    height="32"
                    alt="MyTutorMe logo"
                    style={{ borderRadius: '8px' }}
                  />
                </Column>
                <Column>
                  <Text
                    style={{
                      color: '#10B981',
                      fontSize: '20px',
                      fontWeight: '800',
                      margin: '0',
                      paddingLeft: '10px',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    MyTutorMe
                  </Text>
                </Column>
                <Column align="right">
                  <Text
                    style={{
                      color: '#64748b',
                      fontSize: '11px',
                      margin: '0',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Email Verification
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Main Card */}
            <Section style={{ backgroundColor: '#ffffff' }}>

              {/* Hero gradient section */}
              <Section
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #fffbeb 100%)',
                  padding: '40px 32px 32px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <Text
                  style={{
                    fontSize: '13px',
                    color: '#10B981',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    margin: '0 0 12px',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  ✉️ Verify Your Email
                </Text>
                <Text
                  style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: '#0f172a',
                    margin: '0 0 12px',
                    lineHeight: '1.2',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  Hi {name},<br />confirm your email address.
                </Text>
                <Text
                  style={{
                    fontSize: '15px',
                    color: '#475569',
                    margin: '0 0 28px',
                    lineHeight: '1.6',
                  }}
                >
                  Click the button below to verify your email and unlock full access to MyTutorMe.
                  This link expires in <strong>24 hours</strong>.
                </Text>
                <Button
                  href={verificationLink}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '700',
                    padding: '14px 32px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  Verify Email Address →
                </Button>
              </Section>

              {/* Security note */}
              <Section style={{ padding: '28px 32px' }}>
                <Hr style={{ borderColor: '#e2e8f0', margin: '0 0 24px' }} />
                <Text style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: '1.6' }}>
                  If you didn't create a MyTutorMe account, you can safely ignore this email.
                  Your email address will not be used without verification.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '0 0 16px 16px',
                padding: '20px 32px',
              }}
            >
              <Text style={{ color: '#475569', fontSize: '12px', margin: '0', textAlign: 'center' }}>
                © 2026 MyTutorMe ·{' '}
                <a href="https://mytutorme.org" style={{ color: '#10B981', textDecoration: 'none' }}>
                  mytutorme.org
                </a>
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
