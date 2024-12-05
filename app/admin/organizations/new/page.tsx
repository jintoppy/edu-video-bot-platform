import { redirect } from "next/navigation";
import { CreateOrganizationForm } from "@/components/admin/organizations/new/create-org-form";
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { currentUser } from "@clerk/nextjs/server";

export default async function NewOrganizationPage() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata.role !== "super_admin") {
    redirect("/");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Organization"
        text="Create a new consultancy organization and invite an admin."
      />
      <div className="grid gap-10">
        <CreateOrganizationForm user={user} />
      </div>
    </DashboardShell>
  );
}