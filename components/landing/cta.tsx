import { Button } from '@/components/ui/button'

export default function CTA() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Educational Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of students who have already benefited from our AI-powered counseling.
        </p>
        <Button size="lg" variant="secondary">Get Started Now</Button>
      </div>
    </section>
  )
}

