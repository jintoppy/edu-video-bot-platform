import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
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
