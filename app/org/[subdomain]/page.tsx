import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { organizations } from "@/lib/db/schema";
import OrganizationLandingPage from "@/components/org/OrganizationLandingPage";

export default async function OrgHome({
  params,
}: {
  params: { subdomain: string };
}) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.subdomain, params.subdomain),
  });

  if (!org) {
    notFound();
  }

  const user = await currentUser();

  if (!user) {
    return <OrganizationLandingPage />;
  }

  switch (user.publicMetadata.role) {
    case "student":
      redirect("/dashboard");
    case "counselor":
      redirect("/counselor/dashboard");
    default:
      notFound();
  }
}
