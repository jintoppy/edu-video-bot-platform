import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { LandingPage, landingPages, organizations } from "@/lib/db/schema";
import OrganizationLandingPage from "@/components/org/OrganizationLandingPage";

export default async function OrgHome(
  props: {
    params: Promise<{ subdomain: string }>;
  }
) {
  const params = await props.params;

  console.log('params.subdomain', params.subdomain);

  let landingPage: LandingPage | undefined | null = undefined;
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.subdomain, params.subdomain),
    });

    console.log('org', org);

    if (!org) {
      notFound();
    }

    landingPage = await db.query.landingPages.findFirst({
      where: eq(landingPages.organizationId, org.id),
    });

    console.log('landingPage', landingPage)

    if(!landingPage) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching organization data:', error);
    throw new Error('Failed to load organization data');
  }

  const user = await currentUser();

  if (!user) {
    return <OrganizationLandingPage landingPage={landingPage} />;
  }

  switch (user.publicMetadata.role) {
    case "student":
      redirect(`/org/${params.subdomain}/dashboard`);
    case "counselor":
      redirect(`/org/${params.subdomain}/counselor/dashboard`);
    default:
      return <OrganizationLandingPage landingPage={landingPage} />
  }
}
