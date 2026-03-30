
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Link, Font, Tailwind, Row, Column } from '@react-email/components';

interface PasswordResetEmailProps { name: string; resetLink: string; }

export const PasswordResetEmail = ({ name, resetLink }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Preview>Reset your MyTutorMe password</Preview>
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

              <Section className="bg-white p-10 rounded-[24px] mb-8 text-center border border-outline/50 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl text-slate-500 font-bold font-headline">?</span>
                </div>
                <Text className="text-2xl font-bold font-headline mb-4 text-[#0f172a]">Password Reset</Text>
                <Text className="text-[16px] font-body text-onSurfaceVariant leading-relaxed mb-8 max-w-sm mx-auto">
                  We received a request to reset the password for your account, {name}. Click the button below to establish a new password.
                </Text>
                <Button className="inline-flex px-8 py-3 bg-[#0f172a] text-white font-bold rounded-xl mb-8 shadow-sm" href={resetLink}>
                  Reset Password
                </Button>
                <Text className="text-[13px] font-body text-slate-400 max-w-sm mx-auto">
                  If you did not request a password reset, you can safely ignore this email. Your password will not change until you access the link above and create a new one.
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
