import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    title: "Scale Operations",
    description: "Handle 3x more student inquiries without increasing staff",
  },
  {
    title: "24/7 Availability",
    description: "Provide instant responses to students across all time zones",
  },
  {
    title: "Cost Efficiency",
    description: "Reduce operational costs by up to 40% through automation",
  },
  {
    title: "Quality Assurance",
    description: "Maintain consistent counseling quality with AI assistance",
  },
  {
    title: "Global Reach",
    description: "Support students in multiple languages and regions",
  },
  {
    title: "Data Insights",
    description: "Make informed decisions with comprehensive analytics",
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transform Your Consultancy
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of education consultancies already revolutionizing their operations with Bots4Ed
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;