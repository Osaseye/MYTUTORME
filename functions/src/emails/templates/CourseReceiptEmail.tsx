import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr
} from '@react-email/components';

interface CourseReceiptEmailProps {
  studentName: string;
  courseTitle: string;
  amount: number;
  transactionId: string;
  date: string;
}

export const CourseReceiptEmail = ({
  studentName,
  courseTitle,
  amount,
  transactionId,
  date,
}: CourseReceiptEmailProps) => {
  // Format amount as currency NGN
  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>Your receipt for {courseTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Receipt</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>
            Thank you for your purchase! This email serves as your official receipt for the course <strong>{courseTitle}</strong>.
          </Text>
          
          <Section style={receiptBox}>
            <Text style={receiptText}><strong>Date:</strong> {date}</Text>
            <Text style={receiptText}><strong>Order ID:</strong> {transactionId}</Text>
            <Text style={receiptText}><strong>Course:</strong> {courseTitle}</Text>
            <Hr style={divider} />
            <Text style={totalText}><strong>Total Paid:</strong> {formattedAmount}</Text>
          </Section>

          <Text style={text}>
            You can now log in to your MyTutorMe dashboard and start learning immediately. 
            If you have any questions or issues, please contact our support team.
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
  marginBottom: '14px',
};

const receiptBox = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  margin: '0 48px 24px',
  borderRadius: '6px',
};

const receiptText = {
  color: '#475569',
  fontSize: '14px',
  margin: '4px 0',
};

const totalText = {
  color: '#0f172a',
  fontSize: '16px',
  margin: '12px 0 0 0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '12px 0',
};
