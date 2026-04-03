import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Button
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
      <Head />
      <Preview>Congratulations on completing your course!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Course Completed🎉</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>
            Amazing job! You have fully completed the course <strong>{courseTitle}</strong>. 
            All of that hard work has paid off, and your certificate of completion is now ready for you!
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={certificateUrl}>
              View Your Certificate
            </Button>
          </Section>
          <Text style={text}>
            Keep up the excellent learning momentum!
          </Text>
          <Text style={text}>
            Best,<br />
            The MyTutorMe Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
};

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 48px',
};

const btnContainer = {
  padding: '20px 48px',
};

const button = {
  backgroundColor: '#059669',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};
