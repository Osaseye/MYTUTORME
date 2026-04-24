
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface SubscriptionEmailProps { name: string; planName: string; amount: number; }

export const SubscriptionSuccessEmail = ({ name, planName, amount }: SubscriptionEmailProps) => {
  return (
    <Html>
      <Preview>Your {planName} subscription is active — welcome to premium learning!</Preview>
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
            <Section style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', padding: '40px 32px 36px', borderBottom: '1px solid #d1fae5', textAlign: 'center' }}>
              <Section style={{ width: '72px', height: '72px', backgroundColor: '#10B981', borderRadius: '50%', margin: '0 auto 20px', textAlign: 'center' }}>
                <Text style={{ fontSize: '32px', margin: '0', lineHeight: '72px' }}>✓</Text>
              </Section>
              <Text style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', fontFamily: 'Manrope, sans-serif' }}>
                Subscription Confirmed!
              </Text>
              <Text style={{ fontSize: '16px', color: '#047857', margin: '0 0 6px', fontWeight: '600', fontFamily: 'Manrope, sans-serif' }}>
                {planName} Plan — Active
              </Text>
              <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 28px', lineHeight: '1.6' }}>
                Hi {name}, your premium learning experience is now fully unlocked. You have access to all Pro features.
              </Text>
              <Button
                href="https://mytutorme.org/student/dashboard"
                style={{ backgroundColor: '#10B981', color: '#ffffff', fontSize: '15px', fontWeight: '700', padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontFamily: 'Manrope, sans-serif' }}
              >
                Access Your Dashboard →
              </Button>
            </Section>

            {/* Billing summary */}
            <Section style={{ backgroundColor: '#ffffff', padding: '28px 32px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px', fontFamily: 'Manrope, sans-serif' }}>Payment Summary</Text>
              <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
                <Row style={{ marginBottom: '8px' }}>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Plan</Text></Column>
                  <Column align="right"><Text style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{planName}</Text></Column>
                </Row>
                <Row>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Amount Charged</Text></Column>
                  <Column align="right"><Text style={{ margin: '0', fontSize: '13px', fontWeight: '700', color: '#10B981' }}>₦{amount?.toLocaleString?.() ?? amount}</Text></Column>
                </Row>
              </Section>

              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 14px', fontFamily: 'Manrope, sans-serif' }}>What's Unlocked</Text>
              {[
                '✨ Unlimited AI Tutor queries',
                '📝 Unlimited mock exam generation',
                '🃏 Advanced flashcard tools',
                '📊 Detailed performance analytics',
                '🎓 Priority course access'
              ].map((feature, i) => (
                <Row key={i} style={{ marginBottom: '8px' }}>
                  <Column><Text style={{ margin: '0', fontSize: '13px', color: '#475569' }}>{feature}</Text></Column>
                </Row>
              ))}
            </Section>

            {/* Footer */}
            <Section style={{ backgroundColor: '#0f172a', borderRadius: '0 0 16px 16px', padding: '24px 32px', textAlign: 'center' }}>
              <Text style={{ color: '#10B981', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>MyTutorMe Intelligence</Text>
              <Text style={{ color: '#64748b', fontSize: '11px', margin: '0 0 12px', lineHeight: '1.5' }}>
                © 2026 MyTutorMe Intelligence. All rights reserved.<br />
                Questions? Contact us at support@mytutorme.org
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
