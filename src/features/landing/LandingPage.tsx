import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from './components/HeroSection';
import { PainPointSection } from './components/PainPointSection';
import { FeatureShowcaseSection } from './components/FeatureShowcaseSection';
import { PricingSection } from './components/PricingSection';
import { CoursesPreviewSection } from './components/CoursesPreviewSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-primary/20 selection:text-primary-dark">
        <Navbar />
        <main>
            <section id="hero">
              <HeroSection />
            </section>
            <PainPointSection />
            <section id="platform">
              <FeatureShowcaseSection />
            </section>
            <section id="pricing">
              <PricingSection />
            </section>
            <section id="courses">
              <CoursesPreviewSection />
            </section>
            <section id="resources">
              <TestimonialsSection />
              <FAQSection />
            </section>
            <CTASection />
        </main>
        <Footer />
    </div>
  );
};

export default LandingPage;
