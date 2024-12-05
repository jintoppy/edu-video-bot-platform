"use server";

import { db } from "@/lib/db";
import { organizationInvitations, organizations, users } from "@/lib/db/schema";
import { clerkClient } from "@/lib/clerk";
import { revalidatePath } from "next/cache";
import type { User } from "@clerk/backend";
import { currentUser } from "@clerk/nextjs/server"; 

interface CreateOrganizationInput {
  name: string;
  subdomain: string;
  adminEmail: string;
  adminName: string;
}

export async function createOrganization(input: CreateOrganizationInput) {
  try {
    const user = await currentUser();

    if(!user){
        return;
    }

    // 2. Create organization in your database
    const [org] = await db
      .insert(organizations)
      .values({
        name: input.name,
        subdomain: input.subdomain,
        email: input.adminEmail,
        status: "inactive",
      })
      .returning();

    console.log('org', org);

    // 1. Create organization in Clerk
    const clerkOrg = await clerkClient.organizations.createOrganization({
      name: input.name,
      createdBy: user.id,
      slug: input.subdomain,
      // You can add more metadata as needed
      privateMetadata: {
        createdAt: new Date().toISOString(),
        orgId: org.id,
        adminEmail: input.adminEmail,
        adminName: input.adminName
      },
    });

    console.log('clerkOrg', clerkOrg);
    
    // 3. Create user record in your database

    // 3. Create admin invitation in Clerk
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: clerkOrg.id,
      inviterUserId: user.id,
      emailAddress: input.adminEmail,
      role: "org:admin",
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/org-onboarding`,
      publicMetadata: {
        createdAt: new Date().toISOString(),
        orgId: org.id,
        adminEmail: input.adminEmail,
        adminName: input.adminName
      }
    });

    console.log('invitation', invitation);

    // 4. Create invitation record in your database
    await db.insert(organizationInvitations).values({
      organizationId: org.id,
      email: input.adminEmail,
      role: "org:admin",
      status: "pending",
      clerkInvitationId: invitation.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    revalidatePath("/admin/organizations");
    
    return { success: true, organizationId: org.id };
  } catch (error) {
    console.error("Error creating organization:", error);
    throw new Error("Failed to create organization");
  }
}