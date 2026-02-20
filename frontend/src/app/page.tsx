import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import HowItWorks from '@/components/home/HowItWorks';
import PropertyTypeExplorer from '@/components/home/PropertyTypeExplorer';
import WhyAncerLarins from '@/components/home/WhyAncerLarins';
import PopularAreas from '@/components/home/PopularAreas';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturedProperties />
        <HowItWorks />
        <PropertyTypeExplorer />
        <WhyAncerLarins />
        <PopularAreas />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
