import { getOrganizationSchema } from "@/app/actions/organizations";
import SchemaBuilder from "./components/schema-builder";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BuilderSchema } from "@/types/organization";

export default async function SchemaPage() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return null;
  }

  try {
    const {schema} = await getOrganizationSchema(orgId);
    if(schema){
        return <SchemaBuilder organizationId={orgId} initialSchema={schema as BuilderSchema} />;
    }
    else {
        notFound();
    }
  } catch (error) {
    notFound();
  }
}
