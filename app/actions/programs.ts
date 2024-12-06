'use server';

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getOrganizationBySubdomain(subdomain: string) {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.subdomain, subdomain),
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    return org;
  } catch (error) {
    console.error("Error fetching organization:", error);
    throw error;
  }
}
