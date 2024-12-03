const ProblemSolution = () => {
    return (
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Transforming Challenges into Opportunities
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-primary mb-6">Common Challenges</h3>
              {problems.map((problem, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-red-500 text-xl">⚠</div>
                  <div>
                    <h4 className="font-semibold mb-2">{problem.title}</h4>
                    <p className="text-gray-600">{problem.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-secondary mb-6">Our Solutions</h3>
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold mb-2">{solution.title}</h4>
                    <p className="text-gray-600">{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const problems = [
    {
      title: "Manual Student Management",
      description: "Time-consuming paperwork and manual data entry slowing down your operations.",
    },
    {
      title: "Time-consuming Counseling Sessions",
      description: "Limited capacity to handle multiple student inquiries simultaneously.",
    },
    {
      title: "Limited Global Reach",
      description: "Difficulty expanding services to international markets due to time zones.",
    },
    {
      title: "Resource-intensive Operations",
      description: "High costs associated with maintaining staff for routine tasks.",
    },
  ];
  
  const solutions = [
    {
      title: "AI-powered Student Profiling",
      description: "Automated data collection and analysis for efficient student management.",
    },
    {
      title: "24/7 Virtual Counseling",
      description: "AI-powered chatbots providing instant responses to student queries.",
    },
    {
      title: "Global Program Database",
      description: "Comprehensive database of international programs with real-time updates.",
    },
    {
      title: "Automated Workflows",
      description: "Streamlined processes reducing manual intervention and operational costs.",
    },
  ];
  
  export default ProblemSolution;