import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { landingPages, organizations } from "@/lib/db/schema";
import OrganizationLandingPage from "@/components/org/OrganizationLandingPage";

export default async function OrgHome({
  params,
}: {
  params: { subdomain: string };
}) {

  console.log('params.subdomain', params.subdomain);

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.subdomain, params.subdomain),
  });

  console.log('org', org);

  if (!org) {
    notFound();
  }

  const landingPage = await db.query.landingPages.findFirst({
    where: eq(landingPages.organizationId, org.id),
  });

  console.log('landingPage', landingPage)

  if(!landingPage) {
    notFound();
  }

  const user = await currentUser();

  if (!user) {
    return <OrganizationLandingPage landingPage={landingPage} />;
  }

  switch (user.publicMetadata.role) {
    case "student":
      redirect("/dashboard");
    case "counselor":
      redirect("/counselor/dashboard");
    default:
      return <OrganizationLandingPage landingPage={landingPage} />
  }
}
