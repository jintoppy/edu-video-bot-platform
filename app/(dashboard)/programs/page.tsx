import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProgramsGrid } from "@/components/programs/programs-grid"

export default async function DashboardProgramsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Programs"
        text="Browse available programs and schedule program-specific consultations"
      />
      <ProgramsGrid />
    </DashboardShell>
  )
}