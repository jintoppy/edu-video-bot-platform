'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const scrollToContact = () => {
    const contactSection = document.querySelector('#contact-form');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
              Transform Your Education Consultancy with{" "}
              <span className="text-primary">AI-Powered Solutions</span>
            </h1>
            <p className="text-xl text-gray-600">
              Empower your consultancy with 24/7 AI counseling, seamless program management, and powerful analytics. Partner with EduBot to scale your operations and serve more students globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={scrollToContact}>
                Transform Your Consultancy <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToContact}>
                Get Started
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 -mx-4 px-4">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                <p className="text-4xl font-bold text-primary mb-2">70%</p>
                <p className="text-sm text-gray-600">Faster Response Time</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                <p className="text-4xl font-bold text-primary mb-2">40%</p>
                <p className="text-sm text-gray-600">Cost Reduction</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold text-primary mb-2">3x</p>
                <p className="text-sm text-gray-600">More Students Handled</p>
              </div>
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="relative z-10">
              <img
                src="/hero.jpg"
                alt="AI Education Platform"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg transform translate-x-4 translate-y-4 -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;