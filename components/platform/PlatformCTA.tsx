import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <div className="py-20 bg-[#f9f7f2] relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212529]">
          Ready to Transform Your Education Consultancy?
        </h2>
        <p className="text-xl mb-8 text-[#212529]/90">
          Join hundreds of successful consultancies using EduBot to scale their
          operations.
        </p>
        <Button
          size="lg"
          className="bg-[#ff611d] text-white hover:bg-[#ff611d]/90 text-lg px-8 py-6"
        >
          Start Your Free Trial
        </Button>
        <p className="mt-6 text-[#212529]/70">
          No credit card required • 14-day free trial
        </p>
      </div>
    </div>
  );
};

export default CTA;
