import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { LandingPageBuilder } from "@/components/page-builder/landing-page-builder";

export default function PageBuilderPage() {
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
