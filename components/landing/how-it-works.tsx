import { Button } from '@/components/ui/button'
import { useOrganization } from "@/providers/organization-provider";

export default function HowItWorks() {
  const { settings } = useOrganization();
  
  return (
    <section 
      id="how-it-works" 
      className="py-20 px-4 md:px-6 lg:px-8"
      style={{
        background: `linear-gradient(to right, ${settings.theme.primaryColor}0A, ${settings.theme.secondaryColor}0A)`
      }}
    >
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div 
              className="text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold"
              style={{ backgroundColor: settings.theme.primaryColor }}
            >1</div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-muted-foreground">Students connect with our AI video bot through a simple interface.</p>
          </div>
          <div className="text-center">
            <div 
              className="text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold"
              style={{ backgroundColor: settings.theme.primaryColor }}
            >2</div>
            <h3 className="text-xl font-semibold mb-2">Interact</h3>
            <p className="text-muted-foreground">Engage in human-like conversations to discuss educational goals and concerns.</p>
          </div>
          <div className="text-center">
            <div 
              className="text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold"
              style={{ backgroundColor: settings.theme.primaryColor }}
            >3</div>
            <h3 className="text-xl font-semibold mb-2">Receive Guidance</h3>
            <p className="text-muted-foreground">Get personalized advice and resources tailored to individual needs.</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Button 
            size="lg"
            style={{ 
              backgroundColor: settings.theme.primaryColor,
              color: 'white',
              border: 'none'
            }}
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </section>
  )
}

