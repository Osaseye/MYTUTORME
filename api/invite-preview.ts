export default function handler(req: any, res: any) {
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || 'mytutorme.com';
  const baseUrl = `${protocol}://${host}`;

  const courseId = (req.query.courseId as string) || '';
  const ref = (req.query.ref as string) || '';
  const title = decodeURIComponent(((req.query.title as string) || 'Course').replace(/\+/g, ' ')).trim() || 'Course';
  const inviter = decodeURIComponent(((req.query.inviter as string) || 'A student').replace(/\+/g, ' ')).trim() || 'A student';

  const destination = `${baseUrl}/invite/${encodeURIComponent(courseId)}?ref=${encodeURIComponent(ref)}`;
  const imageUrl = `${baseUrl}/api/invite-og?title=${encodeURIComponent(title)}&inviter=${encodeURIComponent(inviter)}`;

  const pageTitle = `${inviter} asked you to learn ${title}`;
  const description = `${inviter} shared a learning pack on MyTutorMe.`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapeHtml(destination)}" />
    <meta property="og:site_name" content="MyTutorMe" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

    <meta http-equiv="refresh" content="0;url=${escapeHtml(destination)}" />
    <script>window.location.replace(${JSON.stringify(destination)});</script>
  </head>
  <body>
    <p>Redirecting to invite...</p>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
