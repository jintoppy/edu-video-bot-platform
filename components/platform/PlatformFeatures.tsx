import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  return (
    <div id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#212529]">
          Powerful Features for Modern Education Consultancies
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="text-4xl mb-4 text-[#ff611d] group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#212529]">{feature.title}</h3>
                <p className="text-[#212529]/70">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: "🤖",
    title: "AI Video Bot",
    description: "Create personalized video responses with AI-powered avatars for engaging student interactions.",
  },
  {
    icon: "📊",
    title: "Program Management",
    description: "Efficiently manage educational programs with our comprehensive dashboard and analytics.",
  },
  {
    icon: "💬",
    title: "Student Engagement",
    description: "Foster meaningful connections through integrated chat and video call capabilities.",
  },
  {
    icon: "🎨",
    title: "Custom Branding",
    description: "Maintain your brand identity with customizable themes and white-label solutions.",
  },
];

export default Features;