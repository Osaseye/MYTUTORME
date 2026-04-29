function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function sanitizeId(value) {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/[^a-zA-Z0-9_\-]/g, '');
}

module.exports = async function handler(req, res) {
    const sessionId = sanitizeId(req.query.sessionId);
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || '';

    let title = 'Nova AI Conversation';
    let description = 'A Nova AI tutoring session shared via MyTutorMe.';
    let sharedBy = '';

    if (projectId && sessionId) {
        try {
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/ai_sessions/${encodeURIComponent(sessionId)}`;
            const response = await fetch(firestoreUrl);
            if (response.ok) {
                const data = await response.json();
                const fields = data.fields || {};

                const isPublic = fields.isPublic && fields.isPublic.booleanValue;
                if (!isPublic) {
                    res.statusCode = 404;
                    res.end('Not found');
                    return;
                }

                const rawTitle = (fields.title && fields.title.stringValue) || '';
                if (rawTitle) title = rawTitle;

                const rawSharedBy = (fields.sharedBy && fields.sharedBy.stringValue) || '';
                if (rawSharedBy) sharedBy = rawSharedBy;

                const subject = (fields.subject && fields.subject.stringValue) || '';
                const topic = (fields.topic && fields.topic.stringValue) || '';
                const subjectLine = [subject, topic].filter(Boolean).join(' · ');

                if (sharedBy) {
                    description = `${sharedBy} shared a Nova AI tutoring session "${title}"${subjectLine ? ` on ${subjectLine}` : ''} — via MyTutorMe.`;
                } else if (subjectLine) {
                    description = `A Nova AI tutoring session on ${subjectLine} — shared via MyTutorMe.`;
                }
            }
        } catch (_) {
            // fall back to defaults
        }
    }

    const ogTitle = sharedBy ? `${sharedBy} shared: "${title}"` : title;
    const image = 'https://www.mytutorme.org/icon.png';
    const redirectUrl = `/public/chat/${sessionId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(ogTitle)} · Nova AI</title>
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(`https://www.mytutorme.org${redirectUrl}`)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:site_name" content="MyTutorMe" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
  <p>Redirecting…</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.statusCode = 200;
    res.end(html);
};
