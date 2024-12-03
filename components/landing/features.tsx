import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Globe, Brain, Clock, Users } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with students worldwide, breaking geographical barriers."
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Provide personalized guidance based on individual student needs."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Offer round-the-clock support to accommodate different time zones."
  },
  {
    icon: Users,
    title: "Human-like Interaction",
    description: "Engage students with natural, conversational AI technology."
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-10 h-10 mb-4 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

