import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-[#f9f7f2] overflow-hidden font-['Roboto']">
      <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2 space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[#212529]">
            Transform Your Education Consultancy with AI-Powered Solutions
          </h1>
          <p className="text-xl opacity-90 text-[#212529]">
            Streamline your operations, enhance student engagement, and scale globally with our intelligent platform.
          </p>
          <Button size="lg" className="bg-[#ff611d] text-white hover:bg-[#ff611d]/90 text-lg px-8 py-6">
            Start Free Trial
          </Button>
        </div>
        
        <div className="lg:w-1/2 mt-12 lg:mt-0">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl animate-float">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
              alt="Platform Demo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Button variant="ghost" className="text-white text-6xl opacity-80 hover:opacity-100">
                ▶
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl font-bold mb-2 text-[#ff611d]">{stat.value}</div>
              <div className="text-[#212529]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const stats = [
  { value: "500+", label: "Consultancies Onboarded" },
  { value: "50,000+", label: "Students Guided" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default Hero;