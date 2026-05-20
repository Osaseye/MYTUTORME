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
  Link,
} from '@react-email/components';

interface EmailVerificationEmailProps {
  name: string;
  verificationLink: string;
}

export const EmailVerificationEmail = ({ name, verificationLink }: EmailVerificationEmailProps) => {
  return (
    <Html>
      <Preview>One tap to verify — then you're in, {name}.</Preview>
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

        <Body style={{ backgroundColor: '#0B1120', margin: '0', padding: '0', fontFamily: 'Inter, sans-serif' }}>
          <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>

            {/* ── LOGO BAR ── */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Row>
                <Column align="center">
                  <Img
                    src="https://www.mytutorme.org/icon.png"
                    width="44"
                    height="44"
                    alt="MyTutorMe"
                    style={{ borderRadius: '12px', display: 'inline-block' }}
                  />
                  <Text style={{
                    color: '#10B981',
                    fontSize: '18px',
                    fontWeight: '800',
                    margin: '8px 0 0',
                    fontFamily: 'Manrope, sans-serif',
                    letterSpacing: '-0.3px',
                  }}>
                    MyTutorMe
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* ── MAIN CARD ── */}
            <Section style={{
              backgroundColor: '#111827',
              borderRadius: '20px',
              border: '1px solid #1e293b',
              overflow: 'hidden',
            }}>

              {/* Accent strip */}
              <Section style={{
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                height: '4px',
                padding: '0',
              }}>
                <Text style={{ margin: '0', fontSize: '0' }}> </Text>
              </Section>

              {/* Hero content */}
              <Section style={{ padding: '48px 40px 40px' }}>

                {/* Icon */}
                <Section style={{ marginBottom: '32px' }}>
                  <Row>
                    <Column align="center">
                      <Section style={{
                        width: '72px',
                        height: '72px',
                        backgroundColor: 'rgba(16,185,129,0.12)',
                        borderRadius: '20px',
                        border: '1px solid rgba(16,185,129,0.25)',
                        display: 'inline-block',
                        textAlign: 'center',
                      }}>
                        <Text style={{ fontSize: '32px', margin: '0', lineHeight: '72px' }}>✉️</Text>
                      </Section>
                    </Column>
                  </Row>
                </Section>

                {/* Headline */}
                <Text style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#10B981',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  margin: '0 0 12px',
                  textAlign: 'center',
                  fontFamily: 'Manrope, sans-serif',
                }}>
                  Verify Your Email
                </Text>
                <Text style={{
                  fontSize: '30px',
                  fontWeight: '800',
                  color: '#f1f5f9',
                  margin: '0 0 16px',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  fontFamily: 'Manrope, sans-serif',
                }}>
                  Hi {name}, you're<br />almost there.
                </Text>
                <Text style={{
                  fontSize: '15px',
                  color: '#94a3b8',
                  margin: '0 0 36px',
                  lineHeight: '1.7',
                  textAlign: 'center',
                }}>
                  Confirm your email address to unlock everything MyTutorMe has to offer — your AI tutor, mock exams, courses, and more. This link is valid for <strong style={{ color: '#e2e8f0' }}>24 hours</strong>.
                </Text>

                {/* CTA Button */}
                <Section style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <Button
                    href={verificationLink}
                    style={{
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
                    }}
                  >
                    Verify My Email →
                  </Button>
                </Section>

                {/* Divider */}
                <Hr style={{ borderColor: '#1e293b', margin: '0 0 28px' }} />

                {/* Fallback link */}
                <Text style={{ fontSize: '12px', color: '#475569', textAlign: 'center', margin: '0 0 4px' }}>
                  Button not working?
                </Text>
                <Text style={{ fontSize: '11px', color: '#334155', textAlign: 'center', margin: '0', wordBreak: 'break-all' }}>
                  <Link href={verificationLink} style={{ color: '#10B981', textDecoration: 'underline' }}>
                    {verificationLink}
                  </Link>
                </Text>
              </Section>

              {/* Security note */}
              <Section style={{
                backgroundColor: '#0f172a',
                padding: '20px 40px',
                borderTop: '1px solid #1e293b',
              }}>
                <Row>
                  <Column style={{ width: '20px', verticalAlign: 'top', paddingTop: '1px' }}>
                    <Text style={{ margin: '0', fontSize: '14px' }}>🔒</Text>
                  </Column>
                  <Column style={{ paddingLeft: '10px' }}>
                    <Text style={{ fontSize: '12px', color: '#475569', margin: '0', lineHeight: '1.6' }}>
                      Didn't create a MyTutorMe account? You can safely ignore this email — your address will not be used without your confirmation.
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* ── FOOTER ── */}
            <Section style={{ textAlign: 'center', padding: '28px 0 0' }}>
              <Text style={{ color: '#1e293b', fontSize: '12px', margin: '0 0 10px' }}>
                © 2026 MyTutorMe · All rights reserved.
              </Text>
              <Row>
                <Column align="center">
                  <Link href="https://mytutorme.org/privacy" style={{ color: '#334155', fontSize: '11px', textDecoration: 'underline', margin: '0 10px' }}>Privacy</Link>
                  <Link href="https://mytutorme.org/terms" style={{ color: '#334155', fontSize: '11px', textDecoration: 'underline', margin: '0 10px' }}>Terms</Link>
                  <Link href="mailto:support@mytutorme.org" style={{ color: '#334155', fontSize: '11px', textDecoration: 'underline', margin: '0 10px' }}>Support</Link>
                </Column>
              </Row>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
