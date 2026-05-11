import CTASection from "../components/CTASection";
import FeaturedVoices from "../components/FeaturedVoices";
import Hero from "../components/Hero";
import InsideAccess from "../components/InsideAccess";
import Navbar from "../components/Navbar";
import OpportunitiesPreview from "../components/OpportunitiesPreview";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedVoices />
      <OpportunitiesPreview />
      <InsideAccess />
      <CTASection />
    </main>
  );
}
