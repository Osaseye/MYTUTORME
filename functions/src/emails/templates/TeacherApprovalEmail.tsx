
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface TeacherApprovalEmailProps { name: string; loginUrl: string; }

export const TeacherApprovalEmail = ({ name, loginUrl }: TeacherApprovalEmailProps) => {
  return (
    <Html>
      <Preview>Your Teacher Profile is Approved!</Preview>
      <Tailwind config={{
          theme: {
            extend: {
              colors: { 
                primary: '#10B981', 
                surface: '#faf8ff', 
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
        <Body className="bg-surface text-onSurface font-body m-0 p-0 antialiased py-8">
          <Container className="max-w-[600px] mx-auto p-4 md:p-6">

              {/* Header */}
              <Section className="mb-8 w-full px-2">
                <Row>
                  <Column align="left" style={{ width: '40px' }}>
                    <Img src="https://www.mytutorme.org/icon.png" width="32" height="32" alt="TutorMe logo" />
                  </Column>
                  <Column align="left">
                    <Text className="text-[22px] font-extrabold font-headline text-primary m-0 pl-2 tracking-tight">MyTutorMe</Text>
                  </Column>
                </Row>
              </Section>
            
            {/* Main Content */}
            <main className="px-2">

              <Section className="text-center bg-emerald-50 p-10 rounded-[24px] mb-8 border border-emerald-100">
                <Text className="text-3xl md:text-4xl font-extrabold font-headline mb-4 text-primary">Congratulations, {name}!</Text>
                <Text className="text-[16px] font-body text-onSurfaceVariant leading-relaxed mb-6">
                  Your teaching application has been completely <strong>approved</strong>. You have demonstrated the expertise to guide students globally using MyTutorMe's infrastructure.
                </Text>
                <Text className="text-[16px] font-body text-onSurfaceVariant leading-relaxed mb-8">
                  Login to your dashboard to create your very first course and begin generating impact.
                </Text>
                <Button className="inline-flex px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-sm" href={loginUrl}>
                  Access Teacher Dashboard
                </Button>
              </Section>
            </main>


              {/* Footer */}
              <Section className="mt-12 pt-8 border-t border-solid border-outline/50 text-center">
                <Text className="font-headline font-bold text-primary text-xl m-0">MyTutorMe Intelligence</Text>
                <Text className="text-xs font-body text-onSurfaceVariant/80 max-w-[400px] mx-auto my-4 leading-relaxed">
                  © 2026 MyTutorMe Intelligence. All rights reserved. Our mission is to democratize elite education through the power of artificial intelligence.
                </Text>
                <Section className="flex justify-center text-center mt-2">
                  <Link href="#" className="inline-block text-xs font-body text-onSurfaceVariant mx-3 underline">Privacy Policy</Link>
                  <Link href="#" className="inline-block text-xs font-body text-onSurfaceVariant mx-3 underline">Terms of Service</Link>
                  <Link href="#" className="inline-block text-xs font-body text-onSurfaceVariant mx-3 underline">Unsubscribe</Link>
                </Section>
              </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
