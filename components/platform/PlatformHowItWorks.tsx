const HowItWorks = () => {
    return (
      <div id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Get Started in Minutes
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="relative mb-12">
                  <div className="flex items-center mb-4">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className={`ml-8 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const steps = [
    {
      title: "Sign Up & Setup",
      description: "Create your account and complete the initial setup process.",
    },
    {
      title: "Customize Your Platform",
      description: "Personalize your platform with your branding and preferences.",
    },
    {
      title: "Import Programs",
      description: "Add your educational programs and course offerings.",
    },
    {
      title: "Train AI Bot",
      description: "Train your AI assistant with your specific content and requirements.",
    },
    {
      title: "Launch & Scale",
      description: "Go live with your platform and start engaging with students globally.",
    },
  ];
  
  export default HowItWorks;