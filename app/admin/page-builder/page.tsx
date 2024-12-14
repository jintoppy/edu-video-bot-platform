import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { LandingPageBuilder } from "@/components/page-builder/landing-page-builder";
import { auth } from "@clerk/nextjs/server";
import { getOrganizationByClerkOrgId } from "@/app/actions/organizations";

export default async function PageBuilderPage() {
    const { orgId: clerkOrgId } = await auth();

    if(!clerkOrgId){
        return null;
    }

    try {
        const org = await getOrganizationByClerkOrgId(clerkOrgId!);
        if (!org) return null;

        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Page Builder"
                    text="Customize your organization's landing page sections and content."
                    action={
                        <a
                            href={`/org/${org.subdomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            View Site
                        </a>
                    }
                />
            <div className="space-y-4">
                <LandingPageBuilder />
            </div>
        </DashboardShell>
    )
}
