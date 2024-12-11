import { OrganizationProvider } from "@/providers/organization-provider";
import { db } from "@/lib/db";
import { organizations, organizationSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    subdomain: string;
  }>;
}

async function getOrganization(subdomain: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.subdomain, subdomain),
  });

  if (!org) {
    return null;
  }

  const settings = await db.query.organizationSettings.findFirst({
    where: eq(organizationSettings.organizationId, org.id),
  });

  return {
    organization: org,
    settings: settings || {
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
        accentColor: "#6366F1",
        fontFamily: "Inter"
      }
    }
  };
}

export default async function OrganizationLayout(props: OrganizationLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  const result = await getOrganization(params.subdomain);

  if (!result) {
    return null; // or handle 404
  }

  return (
    <OrganizationProvider 
      organization={result.organization}
      settings={result.settings}
    >
      {children}
    </OrganizationProvider>
  );
}
