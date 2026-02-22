import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import HowItWorks from '@/components/home/HowItWorks';
import CTASection from '@/components/home/CTASection';
import WhyAncerLarins from '@/components/home/WhyAncerLarins';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturedProperties />
        <HowItWorks />
        <CTASection />
        <WhyAncerLarins />
      </main>
      <Footer />
    </>
  );
}
