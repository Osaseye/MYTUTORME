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
        
        {/* We split by double newlines for basic paragraph formatting, very common in AI markdown */}
        {examData.studyMaterial.content?.split('\n\n').map((paragraph: string, i: number) => (
          <Text key={i} style={styles.studyGuideContent}>
            {paragraph}
          </Text>
        ))}

        <Footer />
      </Page>
    )}
  </Document>
);
