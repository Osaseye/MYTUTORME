import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get('title') || 'Course';
  const rawInviter = searchParams.get('inviter') || 'A student';

  const title = sanitize(rawTitle, 90);
  const inviter = sanitize(rawInviter, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(130deg, #052e2b 0%, #0f766e 45%, #14b8a6 100%)',
          color: '#ffffff',
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-40px',
            width: '420px',
            height: '420px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.10)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-100px',
            width: '360px',
            height: '360px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '64px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.15)',
                padding: '10px 18px',
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              MyTutorMe Learning Invite
            </div>

            <div
              style={{
                marginTop: '34px',
                fontSize: '56px',
                lineHeight: 1.1,
                fontWeight: 800,
                maxWidth: '1020px',
                textWrap: 'balance',
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '38px', fontWeight: 700 }}>
              {inviter} asked you to learn this course.
            </div>
            <div style={{ fontSize: '28px', opacity: 0.9 }}>
              Tap to open your invite and start learning.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function sanitize(value: string, maxLen: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 3)}...`;
}
