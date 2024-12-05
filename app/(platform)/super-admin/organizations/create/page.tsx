import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateOrganizationForm } from "./components/create-organization-form";

export default async function CreateOrganizationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Create Organization</h1>
      <CreateOrganizationForm />
    </div>
  );
}
