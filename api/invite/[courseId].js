function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function sanitizeId(value) {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/[^a-zA-Z0-9_%\-. ]/g, '');
}

export default async function handler(req, res) {
    const courseId = sanitizeId(req.query.courseId);
    const ref = sanitizeId(req.query.ref);
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || '';

    let title = 'A course on MyTutorMe';
    let description = 'Notes, mock exams and AI tutoring — all in one place.';
    let image = '';

    if (projectId && courseId) {
        try {
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/courses/${encodeURIComponent(courseId)}`;
            const response = await fetch(firestoreUrl);
            if (response.ok) {
                const data = await response.json();
                const fields = data.fields || {};
                const rawTitle = (fields.title && fields.title.stringValue) || (fields.subject && fields.subject.stringValue) || '';
                if (rawTitle) title = rawTitle;
                image = (fields.thumbnailUrl && fields.thumbnailUrl.stringValue) || (fields.thumbnail && fields.thumbnail.stringValue) || '';
                const rawDesc = (fields.description && fields.description.stringValue) || '';
                if (rawDesc) description = rawDesc;
            }
        } catch (_) {
            // fall back to defaults
        }
    }

    const redirectUrl = ref ? `/i/${courseId}?ref=${ref}` : `/i/${courseId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    res.statusCode = 200;
    res.end(html);
}
