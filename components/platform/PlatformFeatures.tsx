import { Card, CardContent } from "@/components/ui/card";
import { Bot, Database, Users, BarChart, Palette, Building } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Video Bot",
    description: "Human-like counselor with video, voice, and text capabilities",
  },
  {
    icon: Database,
    title: "Program Management",
    description: "Flexible database handling any program structure with real-time updates",
  },
  {
    icon: Users,
    title: "Human Integration",
    description: "Smart handover to human counselors when needed with context preservation",
  },
  {
    icon: BarChart,
    title: "Analytics & Insights",
    description: "Comprehensive metrics tracking and performance analysis",
  },
  {
    icon: Palette,
    title: "Customization",
    description: "White-label solution with flexible integration options",
  },
  {
    icon: Building,
    title: "Organization Management",
    description: "Multi-counselor support with role-based access control",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Features for Modern Consultancies
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to digitize and scale your education consultancy
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;