import { ProgramsGrid } from "@/components/programs/programs-grid"
import { getOrganizationBySubdomain } from "@/lib/organizations";

export default async function DashboardProgramsPage({
  params
}: {
  params: { subdomain: string }
}) {
  const organization = await getOrganizationBySubdomain(params.subdomain);
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/programs?orgId=${organization.id}`,
    { cache: 'no-store' }
  );
  const programs = await response.json();

  return (
    <ProgramsGrid programs={programs} />
  )
}
