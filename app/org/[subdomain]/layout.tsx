import { OrganizationProvider } from "@/providers/organization-provider";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: {
    subdomain: string;
  };
}

async function getOrganization(subdomain: string) {
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.subdomain, subdomain))
    .then(res => res[0]);

  if (!org) {
    return null;
  }

  return org;
}

export default async function OrganizationLayout({ 
  children,
  params 
}: OrganizationLayoutProps) {
  const organization = await getOrganization(params.subdomain);

  if (!organization) {
    return null; // or handle 404
  }

  return (
    <OrganizationProvider organization={organization}>
      {children}
    </OrganizationProvider>
  );
}
