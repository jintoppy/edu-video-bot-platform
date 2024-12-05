import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { getUsers } from "@/lib/actions/user";

export default async function UsersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const users = await getUsers();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
