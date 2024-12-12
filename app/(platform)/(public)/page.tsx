import Hero from "@/components/platform/PlatformHero";
import Features from "@/components/platform/PlatformFeatures";
import HowItWorks from "@/components/platform/PlatformHowItWorks";
import Benefits from "@/components/platform/PlatformBenefits";

import ContactForm from "@/components/platform/PlatformContactForm";

export default function PlatformLandingPage() {
  return (
    <>
      <Hero />
      <Benefits />
      <Features />
      <HowItWorks />
      <ContactForm />
    </>
  );
}
