import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";
import Stats from "@/components/stats/Stats";
import Services from "@/components/services/Services";
import HowItWorks from "@/components/how-it-works/HowItWorks";
import WhyUs from "@/components/features/WhyUs";
import FarmerCTA from "@/components/cta/FarmerCTA";
import ChcSection from "@/components/chc-section/ChcSection";
import Technology from "@/components/technology/Technology";
import FinalCTA from "@/components/cta/FinalCTA";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        {/* <Stats /> */}
        <Services />
        <HowItWorks />
        <WhyUs />
        <FarmerCTA />
        <ChcSection />
        <Technology />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
