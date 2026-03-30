
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface WelcomeEmailProps { name: string; role: 'student' | 'teacher' | 'admin'; }

export const WelcomeEmailTemplate = ({ name, role }: WelcomeEmailProps) => {
  return (
    <Html>
      <Preview>Welcome to MyTutorMe! Your AI-First Journey to Academic Excellence Starts Now.</Preview>
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
              
              <Section className="overflow-hidden rounded-2xl bg-emerald-500/10 p-8 md:p-10 mb-8 border border-emerald-500/20">
                <Text className="text-3xl md:text-5xl font-extrabold font-headline leading-tight mb-4 text-[#0f172a]">
                  Welcome to MyTutorMe! Your AI-First Journey Starts Now.
                </Text>
                <Text className="text-lg md:text-xl font-body text-onSurfaceVariant mb-8 leading-relaxed">
                  Experience a new era of learning with a personalized 24/7 AI Tutor designed to accelerate your understanding and boost your GPA through targeted, intelligent support.
                </Text>
                <Button className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl" href="https://mytutorme.org/dashboard">
                  Start Your First Lesson
                </Button>
              </Section>

              <Section className="mb-10 mt-8">
                <Text className="text-2xl font-bold font-headline mb-4">Meet Your Personal Mentor</Text>
                <Text className="text-[16px] text-onSurfaceVariant leading-relaxed mb-6 font-body">
                  MyTutorMe isn't just a platform; it's an intelligent companion. Our 24/7 AI Tutor analyzes your learning patterns to provide real-time explanations, helping you master complex concepts in minutes rather than hours. Whether it's Calculus at midnight or Literature at dawn, we're here to ensure your GPA reflects your true potential.
                </Text>
              </Section>

              <Section className="bg-white p-8 rounded-xl mb-12 shadow-sm border border-outline/30">
                <Text className="text-xl font-bold font-headline mb-6 text-primary flex items-center">
                  <Img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" width="24" height="24" className="mr-2 inline-block opacity-70" />
                  Getting Started Checklist
                </Text>
                
                <Row className="mb-4 bg-surface p-4 rounded-lg">
                  <Column style={{ width: '40px' }}><div className="w-6 h-6 rounded border-2 border-primary flex items-center justify-center text-primary text-sm font-bold opacity-100">✓</div></Column>
                  <Column><Text className="m-0 font-medium font-body text-[15px]">Verify your student email address</Text></Column>
                </Row>
                <Row className="mb-4 bg-surface p-4 rounded-lg">
                  <Column style={{ width: '40px' }}><div className="w-6 h-6 rounded border-2 border-outline flex items-center justify-center"></div></Column>
                  <Column><Text className="m-0 font-medium font-body text-[15px]">Set your academic study goals</Text></Column>
                </Row>
                <Row className="bg-surface p-4 rounded-lg">
                  <Column style={{ width: '40px' }}><div className="w-6 h-6 rounded border-2 border-outline flex items-center justify-center"></div></Column>
                  <Column><Text className="m-0 font-medium font-body text-[15px]">Try your first AI Tutor session</Text></Column>
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
