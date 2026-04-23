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
    opacity: 0.05, // Very faint watermark
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
    marginBottom: 10,
  },
  studyGuideH2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 10,
    marginBottom: 6,
  },
  studyGuideH3: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 5,
  },
  studyGuideBullet: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
    marginBottom: 4,
    marginLeft: 10,
  },
  codeBlock: {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: 9,
    lineHeight: 1.45,
    fontFamily: 'Courier',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    marginTop: 6,
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
  // We use a React-PDF fixed element so it repeats on every page (except the title page, which we'll handle separately if needed)
  <View style={styles.watermarkContainer} fixed>
    {/* Using the public icon.png path, assumes it's available at the origin */}
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

type StudyBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'code'; text: string }
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

    if (trimmed.startsWith('```')) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: 'code', text: codeLines.join('\n') || ' ' });
      continue;
    }

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

    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s+/, '') });
      i += 1;
      continue;
    }

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

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('##') && !lines[i].trim().startsWith('###') && !/^[-*]\s+/.test(lines[i].trim()) && !lines[i].trim().startsWith('```')) {
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
      return <Text key={`h2-${index}`} style={styles.studyGuideH2}>{block.text}</Text>;
    }

    if (block.type === 'h3') {
      return <Text key={`h3-${index}`} style={styles.studyGuideH3}>{block.text}</Text>;
    }

    if (block.type === 'bullet') {
      return <Text key={`b-${index}`} style={styles.studyGuideBullet}>• {block.text}</Text>;
    }

    if (block.type === 'code') {
      return <Text key={`c-${index}`} style={styles.codeBlock}>{block.text}</Text>;
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

    return <Text key={`p-${index}`} style={styles.studyGuideContent}>{block.text}</Text>;
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
