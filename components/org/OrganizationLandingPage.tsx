import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { landingPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import HowItWorks from '@/components/landing/how-it-works';
import Testimonials from '@/components/landing/testimonials';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

const SECTION_COMPONENTS = {
  hero: Hero,
  features: Features,
  howItWorks: HowItWorks,
  testimonials: Testimonials,
  cta: CTA,
};

interface OrganizationLandingPageProps {
  organizationId: string;
}

export default async function OrganizationLandingPage({ organizationId }: OrganizationLandingPageProps) {
  // Fetch landing page configuration from the database
  const landingPage = await db.query.landingPages.findFirst({
    where: eq(landingPages.organizationId, organizationId),
  });

  // If no configuration found, show default layout
  const sections = landingPage?.sections || [];
  const isPublished = landingPage?.isPublished || false;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="pt-16">
        {sections.length > 0 ? (
          sections
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const Component = SECTION_COMPONENTS[section.type as keyof typeof SECTION_COMPONENTS];
              if (!Component) return null;
              
              return (
                <Component 
                  key={section.id} 
                  {...section.content} 
                />
              );
            })
        ) : (
          // Default sections if no configuration exists
          <>
            <Hero />
            <Features />
            <HowItWorks />
            <Testimonials />
            <CTA />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

