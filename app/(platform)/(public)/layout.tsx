import Header from "@/components/platform/PlatformHeader";
import Footer from "@/components/platform/PlatformFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-['Roboto']">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
