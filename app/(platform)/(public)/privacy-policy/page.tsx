import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 py-16 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: December 12, 2024
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Introduction</h2>
              <p>
                We respect your privacy and are committed to protecting your
                personal data. This privacy policy explains how we collect, use,
                and safeguard your information when you use our AI-powered
                student counseling platform.
              </p>
            </section>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
              <div className="space-y-3">
                <h3 className="text-xl font-medium">Personal Information</h3>
                <p>
                  We collect information that you provide directly to us,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name and contact details</li>
                  <li>Educational background and academic records</li>
                  <li>Test scores and certifications</li>
                  <li>Career goals and preferences</li>
                  <li>Financial information related to education planning</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                How We Use Your Information
              </h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing personalized program recommendations</li>
                <li>Improving our AI counseling services</li>
                <li>Analyzing and enhancing user experience</li>
                <li>Communicating updates and relevant opportunities</li>
                <li>
                  Ensuring compliance with educational institutions'
                  requirements
                </li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your
                personal information, including encryption, secure servers, and
                regular security assessments. Our AI systems are designed with
                privacy-by-design principles.
              </p>
            </section>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Data Sharing and Third Parties
              </h2>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Educational institutions you're interested in</li>
                <li>Service providers who assist in platform operations</li>
                <li>Legal authorities when required by law</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </section>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our privacy
                practices, please contact us at:
              </p>
              <p className="font-medium">jinto@bots4ed.com</p>
            </section>
          </Card>

          <p className="text-sm text-muted-foreground text-center">
            This privacy policy is subject to change. We will notify users of
            any material changes via email or through the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
