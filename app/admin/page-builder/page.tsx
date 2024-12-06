import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

export default function PageBuilderPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Page Builder"
                text="Create and manage your website pages."
            />
            <div className="space-y-4">
                {/* main content here  */}
            </div>
        </DashboardShell>
    )
}