'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useOrganization } from "@/providers/organization-provider";

const testimonials = [
  {
    name: "Sarah L.",
    role: "International Student",
    content: "Bots4Ed AI made my journey to study abroad so much easier. The personalized guidance was invaluable!",
    avatar: "SL"
  },
  {
    name: "Michael T.",
    role: "University Counselor",
    content: "As a counselor, I'm impressed by how Bots4Ed AI complements our work and provides 24/7 support to students.",
    avatar: "MT"
  },
  {
    name: "Aisha K.",
    role: "Parent",
    content: "The AI video bot gave us peace of mind as we helped our daughter navigate international education options.",
    avatar: "AK"
  }
]

export default function Testimonials() {
  const { settings } = useOrganization();
  
  return (
    <section 
      id="testimonials" 
      className="py-20 px-4 md:px-6 lg:px-8"
      style={{
        background: `linear-gradient(to right, ${settings.theme.primaryColor}0A, ${settings.theme.secondaryColor}0A)`
      }}
    >
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What People Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">{testimonial.content}</p>
              </CardContent>
              <CardFooter>
                <Avatar className="mr-4">
                  <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p 
                    className="font-semibold"
                    style={{ color: settings.theme.primaryColor }}
                  >
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

