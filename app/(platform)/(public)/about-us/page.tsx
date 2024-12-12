import { Card, CardContent } from "@/components/ui/card";

export default function AboutUs() {
  return (
    <div className="flex-1 pt-24">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-wide">About Us</h1>
            <p className="text-muted-foreground">
              Learn more about our AI-powered student counseling platform
            </p>
          </div>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="/jinto-photo.png"
                    alt="Jinto Jose"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">Jinto Jose</h2>
                    <p className="text-muted-foreground">
                      Founder & Lead Developer
                    </p>
                  </div>

                  <p className="text-lg">
                    As a passionate developer and education enthusiast, I
                    created this platform to revolutionize how international
                    students receive counseling and guidance. With years of
                    experience in both education and technology sectors, I
                    understand the challenges students face when pursuing
                    international education.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Our Platform</h2>
              <p className="text-lg">
                We've built a cutting-edge AI-powered video bot that provides
                personalized guidance to international students. Our platform
                combines advanced artificial intelligence with comprehensive
                education data to offer:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">For Students</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Personalized program recommendations</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>24/7 counseling support</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Real-time eligibility assessment</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Technology Stack</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Advanced Natural Language Processing</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Real-time video interactions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Intelligent recommendation engine</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
