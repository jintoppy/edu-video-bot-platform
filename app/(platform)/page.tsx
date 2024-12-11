import Header from "@/components/platform/PlatformHeader";
import Hero from "@/components/platform/PlatformHero";
import Features from "@/components/platform/PlatformFeatures";
import HowItWorks from "@/components/platform/PlatformHowItWorks";
import Benefits from "@/components/platform/PlatformBenefits";
import Footer from "@/components/platform/PlatformFooter";
import ContactForm from "@/components/platform/PlatformContactForm";

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen font-['Roboto']">
      <Header />
      <Hero />
      <Benefits />
      <Features />
      <HowItWorks />
      <ContactForm />
      <Footer />
    </div>
  );
};