"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useOrganization } from "@/providers/organization-provider";

export default function Hero() {
  const { settings } = useOrganization();
  
  return (
    <section 
      className="py-20 px-4 md:px-6 lg:px-8"
      style={{
        background: `linear-gradient(to right, ${settings.theme.primaryColor}1A, ${settings.theme.secondaryColor}1A)`
      }}
    >
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Revolutionize Student Counseling with AI
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Our AI-powered video bot provides human-like interactions and
          personalized guidance for international education.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="mr-4">
            Try It Now
          </Button>
        </Link>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </div>
    </section>
  );
}
