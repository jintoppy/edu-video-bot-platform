import { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { RecommendedPrograms } from "@/components/dashboard/recommended-programs"
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions"
import { ProfileCompletion } from "@/components/dashboard/profile-completion"

export const metadata: Metadata = {
  title: "Dashboard | EduBot",
  description: "Manage your educational journey",
}

export default async function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your educational journey."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProfileCompletion />
        <UpcomingSessions />
        <RecommendedPrograms />
      </div>
    </DashboardShell>
  )
}