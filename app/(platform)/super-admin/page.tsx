import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getOrganizations } from "@/lib/actions/organization";

export default async function SuperAdminPage() {
  redirect("/super-admin/organizations");
}
