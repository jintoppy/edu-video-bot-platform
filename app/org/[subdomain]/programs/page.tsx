import { getOrganizationBySubdomain } from "@/app/actions/programs";
import { ProgramsGrid } from "@/components/programs/programs-grid";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";

export default async function DashboardProgramsPage({
  params,
}: {
  params: { subdomain: string };
}) {
  const organization = await getOrganizationBySubdomain(params.subdomain);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/programs?orgId=${organization.id}`,
    { cache: "no-store" }
  );
  const programs = await response.json();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="pt-16">
        <ProgramsGrid programs={programs} />
      </main>
      <Footer />
    </div>
  );
}
