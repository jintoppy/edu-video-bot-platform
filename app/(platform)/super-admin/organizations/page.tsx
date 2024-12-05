import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

export default async function OrganizationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const orgs = await db.select().from(organizations);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Link href="/super-admin/organizations/create">
          <Button>Create Organization</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={orgs} />
    </div>
  );
}
