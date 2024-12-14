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
        
    } catch (error) {
        return null;
    }


    return (
        <DashboardShell>
            <DashboardHeader
                heading="Page Builder"
                text="Customize your organization's landing page sections and content."
            />
            <div className="space-y-4">
                <LandingPageBuilder />
            </div>
        </DashboardShell>
    )
}
