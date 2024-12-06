'use client';

import { Button } from '@/components/ui/button'
import { useOrganization } from "@/providers/organization-provider";

export default function CTA() {
  const { settings } = useOrganization();
  
  return (
    <section 
      className="py-20 px-4 md:px-6 lg:px-8 text-white"
      style={{
        background: `linear-gradient(to right, ${settings.theme.primaryColor}, ${settings.theme.secondaryColor})`
      }}
    >
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Educational Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of students who have already benefited from our AI-powered counseling.
        </p>
        <Button 
          size="lg"
          style={{ 
            backgroundColor: 'white',
            color: settings.theme.primaryColor,
            border: 'none'
          }}
        >
          Get Started Now
        </Button>
      </div>
    </section>
  )
}

