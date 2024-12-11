import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Initial Contact",
    description: "Express interest and discuss your consultancy's unique needs",
    items: ["Partnership evaluation", "Custom demo", "Requirement analysis"],
  },
  {
    icon: Settings,
    title: "Onboarding Process",
    description: "Seamless setup and customization of your platform",
    items: ["Organization setup", "Platform customization", "Team training"],
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Go live with full support and optimization",
    items: ["Go-live support", "Performance monitoring", "Regular check-ins"],
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple Onboarding Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with EduBot in three simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="animate-fade-up relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <step.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-600">
                      <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200"></div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;