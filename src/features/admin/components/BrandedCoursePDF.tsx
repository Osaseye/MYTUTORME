import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

const BRAND = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#84CC16',
  backgroundLight: '#F8FAFC',
  surfaceLight: '#FFFFFF',
  sidebarBg: '#0f172a'
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: BRAND.surfaceLight,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  watermarkImage: {
    width: 300,
    height: 300,
    opacity: 0.05,
  },
  titlePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  titleLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  titleHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BRAND.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  titleSub: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 50,
  },
  header: {
    backgroundColor: BRAND.primary,
    padding: 20,
    marginBottom: 25,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#ecfdf5',
    fontSize: 12,
    marginTop: 4
  },
  headerLink: {
    color: '#fff',
    fontSize: 10,
    textDecoration: 'none',
  },
  studyGuideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND.sidebarBg,
    borderBottomWidth: 2,
    borderBottomColor: BRAND.primary,
    paddingBottom: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  studyGuideContent: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 8,
  },
  studyGuideH2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 14,
    marginBottom: 6,
  },
  studyGuideH3: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 10,
    marginBottom: 5,
  },
  studyGuideBullet: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
    marginBottom: 4,
    marginLeft: 10,
  },
  // Code block: outer View holds bg/padding, inner Text holds color/font
  codeBlock: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 6,
  },
  codeBlockHeader: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginBottom: 0,
  },
  codeBlockHeaderText: {
    color: '#94a3b8',
    fontSize: 8,
    fontFamily: 'Helvetica',
    letterSpacing: 0.5,
  },
  codeBlockLine: {
    color: '#e2e8f0',
    fontSize: 9,
    fontFamily: 'Courier',
    lineHeight: 1.5,
  },
  // Numbered list item
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 5,
    marginLeft: 4,
    alignItems: 'flex-start',
  },
  numberedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
    marginTop: 1,
  },
  numberedBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  numberedText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
    flex: 1,
  },
  // Callout / note box
  calloutBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: BRAND.primary,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    marginTop: 6,
  },
  calloutLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: BRAND.primaryDark,
    marginBottom: 3,
  },
  calloutText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#166534',
  },
  // Horizontal divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 12,
  },
  tableBlock: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginBottom: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderRow: {
    backgroundColor: '#f1f5f9',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    marginTop: 25
  },
  questionBlock: {
    marginBottom: 20,
    paddingLeft: 10,
  },
  questionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  optionText: {
    fontSize: 10,
    color: '#475569',
    marginLeft: 15,
    marginBottom: 5,
    lineHeight: 1.3,
  },
  theoryLines: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: '#cbd5e1',
    marginTop: 25,
    height: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 9,
  },
  footerLink: {
    color: BRAND.primary,
    fontSize: 9,
    textDecoration: 'none',
  }
});

interface PDFProps {
  courseTitle: string;
  courseCode?: string;
  examData: any;
}

const Watermark = () => (
  <View style={styles.watermarkContainer} fixed>
    <Image src="/icon.png" style={styles.watermarkImage} />
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
      `Page ${pageNumber} of ${totalPages}`
    )} />
    <Link src="https://mytutorme.org" style={styles.footerLink}>www.mytutorme.org</Link>
    <Text style={styles.footerText}>Powered by MyTutorMe AI</Text>
  </View>
);

// Renders a string with **bold** markers as proper bold <Text> spans.
// Single-asterisk *italic* is stripped cleanly (no special style — PDF font support is limited).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inlineRender = (text: string, baseStyle: any, key: string) => {
  // Normalise single-asterisk italic to plain text first, then handle bold.
  const normalised = text.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1');
  const parts = normalised.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) {
    return <Text key={key} style={baseStyle}>{normalised}</Text>;
  }
  return (
    <Text key={key} style={baseStyle}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <Text key={i} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>
          : part
      )}
    </Text>
  );
};

type StudyBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; text: string; number: string }
  | { type: 'code'; text: string; lang?: string }
  | { type: 'callout'; text: string }
  | { type: 'divider' }
  | { type: 'table'; rows: string[][] };

const parseMarkdownishContent = (content: string): StudyBlock[] => {
  const blocks: StudyBlock[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || undefined;
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: 'code', text: codeLines.join('\n') || ' ', lang });
      continue;
    }

    // Headings
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
      i += 1;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
      i += 1;
      continue;
    }

    // Horizontal divider
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      blocks.push({ type: 'divider' });
      i += 1;
      continue;
    }

    // Bullet list (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s+/, '') });
      i += 1;
      continue;
    }

    // Numbered list (1. 2. etc.)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      blocks.push({ type: 'numbered', text: numberedMatch[2], number: numberedMatch[1] });
      i += 1;
      continue;
    }

    // Callout / blockquote
    if (trimmed.startsWith('> ')) {
      const calloutLines: string[] = [trimmed.replace(/^>\s+/, '')];
      i += 1;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        calloutLines.push(lines[i].trim().replace(/^>\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'callout', text: calloutLines.join(' ') });
      continue;
    }

    // Markdown table
    if (trimmed.includes('|') && i + 1 < lines.length && /^\s*\|?\s*[-:]{3,}/.test(lines[i + 1])) {
      const tableLines: string[] = [trimmed, lines[i + 1].trim()];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const rows = tableLines
        .filter((_, idx) => idx !== 1)
        .map((r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
      if (rows.length > 0) {
        blocks.push({ type: 'table', rows });
      }
      continue;
    }

    // Paragraph — collect consecutive plain lines
    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('##') &&
      !lines[i].trim().startsWith('###') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !/^-{3,}$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
  }

  return blocks;
};

const renderStudyBlocks = (content: string) => {
  const blocks = parseMarkdownishContent(content);

  return blocks.map((block, index) => {
    if (block.type === 'h2') {
      return inlineRender(block.text, styles.studyGuideH2, `h2-${index}`);
    }

    if (block.type === 'h3') {
      return inlineRender(block.text, styles.studyGuideH3, `h3-${index}`);
    }

    if (block.type === 'bullet') {
      return (
        <View key={`b-${index}`} style={{ flexDirection: 'row', marginBottom: 4, marginLeft: 8 }}>
          <Text style={{ color: BRAND.primary, fontSize: 11, marginRight: 6, lineHeight: 1.5 }}>•</Text>
          {inlineRender(block.text, styles.studyGuideBullet, `bt-${index}`)}
        </View>
      );
    }

    if (block.type === 'numbered') {
      return (
        <View key={`n-${index}`} style={styles.numberedItem}>
          <View style={styles.numberedBadge}>
            <Text style={styles.numberedBadgeText}>{block.number}</Text>
          </View>
          {inlineRender(block.text, styles.numberedText, `nt-${index}`)}
        </View>
      );
    }

    if (block.type === 'callout') {
      return (
        <View key={`call-${index}`} style={styles.calloutBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.calloutLabel}>NOTE</Text>
            {inlineRender(block.text, styles.calloutText, `callt-${index}`)}
          </View>
        </View>
      );
    }

    if (block.type === 'divider') {
      return <View key={`div-${index}`} style={styles.divider} />;
    }

    if (block.type === 'code') {
      const codeLines = block.text.split('\n');
      const label = block.lang ? block.lang.toUpperCase() : 'CODE';
      return (
        <View key={`c-${index}`}>
          <View style={styles.codeBlockHeader}>
            <Text style={styles.codeBlockHeaderText}>{label}</Text>
          </View>
          <View style={styles.codeBlock}>
            {codeLines.map((codeLine, li) => (
              <Text key={li} style={styles.codeBlockLine}>{codeLine || ' '}</Text>
            ))}
          </View>
        </View>
      );
    }

    if (block.type === 'table') {
      const [header, ...bodyRows] = block.rows;
      return (
        <View key={`t-${index}`} style={styles.tableBlock}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {header.map((cell, cIdx) => (
              <Text key={`th-${index}-${cIdx}`} style={[styles.tableCell, styles.tableHeaderCell]}>{cell}</Text>
            ))}
          </View>
          {bodyRows.map((row, rIdx) => (
            <View key={`tr-${index}-${rIdx}`} style={styles.tableRow}>
              {row.map((cell, cIdx) => (
                <Text key={`td-${index}-${rIdx}-${cIdx}`} style={styles.tableCell}>{cell}</Text>
              ))}
            </View>
          ))}
        </View>
      );
    }

    // paragraph
    return inlineRender(block.text, styles.studyGuideContent, `p-${index}`);
  });
};

export const BrandedCoursePDF = ({ courseTitle, courseCode, examData }: PDFProps) => (
  <Document>
    {/* TITLE PAGE */}
    <Page size="A4" style={styles.page}>
      <View style={styles.watermarkContainer}>
        <Image src="/icon.png" style={{ width: 400, height: 400, opacity: 0.03 }} />
      </View>
      <View style={styles.titlePage}>
        <Image src="/icon.png" style={styles.titleLogo} />
        <Text style={styles.titleHeader}>MyTutorMe</Text>
        <Text style={styles.titleSub}>Official Course Study Material</Text>

        <View style={{ backgroundColor: '#f1f5f9', padding: 20, borderRadius: 8, width: '100%', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 8 }}>{courseTitle}</Text>
          <Text style={{ fontSize: 10, color: '#64748b' }}>Course Code: {courseCode || examData?.courseId || 'N/A'}</Text>
        </View>
      </View>
    </Page>

    {/* STUDY MATERIAL PAGE(S) */}
    {examData?.studyMaterial && (
      <Page size="A4" style={styles.page}>
        <Watermark />
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>MyTutorMe</Text>
            <Text style={styles.subtitle}>{courseTitle} - Preparatory Material</Text>
          </View>
          <Link src="https://mytutorme.org" style={styles.headerLink}>Visit Platform</Link>
        </View>

        <Text style={styles.studyGuideTitle}>{examData.studyMaterial.title || 'Study Guide'}</Text>

        {renderStudyBlocks(examData.studyMaterial.content || '')}

        <Footer />
      </Page>
    )}
  </Document>
);
