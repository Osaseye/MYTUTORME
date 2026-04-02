
import { Html, Head, Preview, Body, Container, Section, Text, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface TeacherRejectionEmailProps { name: string; reason: string; }

export const TeacherRejectionEmail = ({ name, reason }: TeacherRejectionEmailProps) => {
  return (
    <Html>
      <Preview>Update regarding your Teacher Application</Preview>
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

              <Section className="p-8 rounded-xl mb-8 border border-outline/50 bg-white">
                <Text className="text-2xl font-bold font-headline mb-4 text-[#0f172a]">Application Update</Text>
                <Text className="text-[16px] font-body text-onSurfaceVariant leading-relaxed mb-6">
                  Thank you for applying to instruct on MyTutorMe, {name}. After rigorous review by our educational standards board, we are unable to approve your application at this time.
                </Text>
                
                <Section className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-r-xl">
                  <Text className="m-0 text-red-800 font-body text-[15px]"><strong>Reviewer Feedback:</strong><br/><br/>{reason}</Text>
                </Section>
                
                <Text className="text-[15px] font-body text-onSurfaceVariant leading-relaxed mb-0">
                  Please address the mentioned items and submit an updated application. We support continuous development and welcome a re-evaluation!
                </Text>
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
