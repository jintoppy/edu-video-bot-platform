import Header from "@/components/platform/PlatformHeader";
import Hero from "@/components/platform/PlatformHero";
import ProblemSolution from "@/components/platform/PlatformProblemSolution";
import Features from "@/components/platform/PlatformFeatures";
import HowItWorks from "@/components/platform/PlatformHowItWorks";
import CTA from "@/components/platform/PlatformCTA";
import Footer from "@/components/platform/PlatformFooter";

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen font-['Roboto']">
      <Header />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};