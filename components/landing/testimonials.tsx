import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: "Sarah L.",
    role: "International Student",
    content: "EduBot AI made my journey to study abroad so much easier. The personalized guidance was invaluable!",
    avatar: "SL"
  },
  {
    name: "Michael T.",
    role: "University Counselor",
    content: "As a counselor, I'm impressed by how EduBot AI complements our work and provides 24/7 support to students.",
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
  return (
    <section id="testimonials" className="py-20 px-4 md:px-6 lg:px-8">
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
                  <p className="font-semibold">{testimonial.name}</p>
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

