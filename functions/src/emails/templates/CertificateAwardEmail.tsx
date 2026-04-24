import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
  Section,
  Button,
  Img,
  Link,
  Font,
  Row,
  Column
} from '@react-email/components';

interface CertificateAwardEmailProps {
  studentName: string;
  courseTitle: string;
  certificateUrl: string;
}

export const CertificateAwardEmail = ({
  studentName,
  courseTitle,
  certificateUrl,
}: CertificateAwardEmailProps) => {
  return (
    <Html>
      <Head>
        <Font fontFamily="Inter" fallbackFontFamily="sans-serif" webFont={{ url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeAmM.woff2", format: "woff2" }} fontWeight={400} />
        <Font fontFamily="Manrope" fallbackFontFamily="sans-serif" webFont={{ url: "https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B_w.woff2", format: "woff2" }} fontWeight={800} />
      </Head>
      <Preview>🏆 Your certificate for {courseTitle} is ready — Congratulations, {studentName}!</Preview>
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

          {/* Gold hero */}
          <Section style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 50%, #fde68a 100%)', padding: '40px 32px', textAlign: 'center', borderBottom: '2px solid #fbbf24' }}>
            <Text style={{ fontSize: '56px', margin: '0 0 12px' }}>🏆</Text>
            <Text style={{ fontSize: '28px', fontWeight: '800', color: '#78350f', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>
              Course Completed!
            </Text>
            <Text style={{ fontSize: '16px', color: '#92400e', margin: '0 0 6px', fontWeight: '600', fontFamily: 'Manrope, sans-serif' }}>
              Congratulations, {studentName}!
            </Text>
            <Text style={{ fontSize: '14px', color: '#92400e', margin: '0 0 24px', lineHeight: '1.6' }}>
              You've successfully completed <strong>"{courseTitle}"</strong>. Your certificate of achievement is ready!
            </Text>
            <Button
              href={certificateUrl}
              style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: '700', padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontFamily: 'Manrope, sans-serif' }}
            >
              View Your Certificate →
            </Button>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: '#ffffff', padding: '28px 32px' }}>
            <Text style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', margin: '0 0 20px' }}>
              Your dedication and hard work have paid off! This certificate recognizes your commitment to learning and your achievement in completing this course.
            </Text>

            <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
              <Text style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Achievement Unlocked</Text>
              <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>📜 Certificate of Completion</Text>
              <Text style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>{courseTitle}</Text>
            </Section>

            <Text style={{ fontSize: '14px', color: '#475569', margin: '0' }}>
              Keep the momentum going — explore more courses in your dashboard and continue your learning journey.
            </Text>
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
    </Html>
  );
};

