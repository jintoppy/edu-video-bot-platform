"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface LeadFormData {
  name: string;
  consultancy: string;
  email: string;
  scale: string;
  challenges: string;
}

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    consultancy: "",
    email: "",
    scale: "",
    challenges: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          consultancy: formData.consultancy.trim(),
          email: formData.email.trim().toLowerCase(),
          scale: formData.scale.trim(),
          challenges: formData.challenges.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Request Submitted Successfully!",
          description:
            "Thank you for your interest. Our team will contact you soon.",
          variant: "default",
        });

        // Reset form
        setFormData({
          name: "",
          consultancy: "",
          email: "",
          scale: "",
          challenges: "",
        });
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly via email. jintoppy@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transform Your Education Consultancy
          </h2>
          <p className="text-xl text-gray-600">
            Take the first step towards revolutionizing your education consultancy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name*
              </label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full"
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="consultancy" className="block text-sm font-medium text-gray-700 mb-2">
                Consultancy Name*
              </label>
              <Input
                id="consultancy"
                required
                value={formData.consultancy}
                onChange={handleChange}
                placeholder="Global Education Solutions"
                className="w-full"
                maxLength={200}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Business Email*
            </label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@yourdomain.com"
              className="w-full"
              maxLength={255}
            />
          </div>

          <div>
            <label htmlFor="scale" className="block text-sm font-medium text-gray-700 mb-2">
              Current Operations Scale*
            </label>
            <Input
              id="scale"
              required
              value={formData.scale}
              onChange={handleChange}
              placeholder="e.g., Number of students handled annually"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-2">
              Main Challenges*
            </label>
            <Textarea
              id="challenges"
              required
              value={formData.challenges}
              onChange={handleChange}
              placeholder="What are the main challenges you're looking to solve?"
              className="w-full"
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⌛</span> 
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </Button>

          <p className="text-sm text-gray-500 text-center mt-4">
            After submitting this form, we will be connecting with you soon.
          </p>
        </form>
      </div>
    </div>
  </section>
  );
};

export default ContactForm;
