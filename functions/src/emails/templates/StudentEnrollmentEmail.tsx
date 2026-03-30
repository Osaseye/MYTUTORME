
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface StudentEnrollmentEmailProps { studentName: string; courseTitle: string; courseUrl: string; teacherName: string; }

export const StudentEnrollmentEmail = ({ studentName, courseTitle, courseUrl, teacherName }: StudentEnrollmentEmailProps) => {
  return (
    <Html>
      <Preview>You've successfully enrolled!</Preview>
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

              <Section className="overflow-hidden rounded-2xl bg-[#0f172a] p-10 mb-10 shadow-md relative">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
                <Text className="text-3xl md:text-4xl font-extrabold font-headline leading-tight mb-4 text-white relative z-10">
                  You're In! 🎉
                </Text>
                <Text className="text-[16px] md:text-lg font-body text-slate-300 leading-relaxed mb-8 relative z-10">
                  Get ready, {studentName}. You're officially enrolled in <strong>{courseTitle}</strong> taught by <strong className="text-white">{teacherName}</strong>. 
                </Text>
                <Button className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-extrabold rounded-xl shadow-sm relative z-10" href={courseUrl}>
                  Access Course Material
                </Button>
              </Section>
              
              <Section className="mb-4 bg-white p-8 rounded-xl shadow-sm border border-outline/30">
                <Text className="text-xl font-bold font-headline mb-6 text-primary">Tips for Success</Text>
                
                <Row className="mb-4">
                  <Column style={{ width: '40px', verticalAlign: 'top' }}><Text className="m-0 text-xl font-headline text-slate-300 font-bold">1</Text></Column>
                  <Column><Text className="m-0 font-medium font-body text-[15px] text-onSurfaceVariant">Schedule consistent study blocks in your calendar.</Text></Column>
                </Row>
                <Row className="mb-4">
                  <Column style={{ width: '40px', verticalAlign: 'top' }}><Text className="m-0 text-xl font-headline text-slate-300 font-bold">2</Text></Column>
                  <Column><Text className="m-0 font-medium font-body text-[15px] text-onSurfaceVariant">Leverage the 24/7 AI tutor when you encounter roadblocks.</Text></Column>
                </Row>
                <Row className="mb-4">
                  <Column style={{ width: '40px', verticalAlign: 'top' }}><Text className="m-0 text-xl font-headline text-slate-300 font-bold">3</Text></Column>
                  <Column><Text className="m-0 font-medium font-body text-[15px] text-onSurfaceVariant">Engage with your fellow students in the course community.</Text></Column>
                </Row>
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
