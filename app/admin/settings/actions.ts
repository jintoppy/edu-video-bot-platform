"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizationSettings, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { clerkClient } from "@/lib/clerk";

interface ThemeUpdate {
  primary: string;
  secondary: string;
}

interface LogoUpdate {
  file: {
    name: string;
    type: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };
  orgName: string;
}

export async function updateOrganizationTheme(theme: ThemeUpdate) {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Get organization record first
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org?.id) {
    throw new Error("Organization not found");
  }

  // First, try to update existing settings
  const result = await db
    .update(organizationSettings)
    .set({
      theme: {
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
      },
      updatedAt: new Date(),
    })
    .where(eq(organizationSettings.organizationId, org.id))
    .returning();

  // If no settings exist, create them
  if (result.length === 0) {
    await db.insert(organizationSettings).values({
      organizationId: org.id,
      theme: {
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
      },
    });
  }

  revalidatePath("/admin/settings");
}

export async function updateOrganizationLogo({ file, orgName }: LogoUpdate) {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Get organization record first
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org?.id) {
    throw new Error("Organization not found");
  }

  try {
    const file = formData.get('file') as File;
    const orgName = formData.get('orgName') as string;
    
    if (!file || !orgName) {
      throw new Error("File and organization name are required");
    }

    const filename = `${orgName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}${file.name.substring(
      file.name.lastIndexOf(".")
    )}`;

    const { url } = await put(`logos/${filename}`, file, {
      access: "public",
    });

    console.log("Logo uploaded to:", url);
    // First, try to update existing settings
    const result = await db
      .update(organizationSettings)
      .set({
        logo: url,
        updatedAt: new Date(),
      })
      .where(eq(organizationSettings.organizationId, org.id))
      .returning();

    // If no settings exist, create them
    if (result.length === 0) {
      await db.insert(organizationSettings).values({
        organizationId: orgId,
        logo: url,
      });
    }

    revalidatePath("/admin/settings");
    return url;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw new Error("Failed to upload logo");
  }
}

export async function getOrganizationTheme() {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Get organization record first
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org?.id) {
    throw new Error("Organization not found");
  }

  const settings = await db.query.organizationSettings.findFirst({
    where: eq(organizationSettings.organizationId, org.id),
  });

  return settings?.theme as
    | { primaryColor: string; secondaryColor: string }
    | undefined;
}

export async function getOrganizationLogo() {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Get organization record first
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org?.id) {
    throw new Error("Organization not found");
  }

  const settings = await db.query.organizationSettings.findFirst({
    where: eq(organizationSettings.organizationId, orgId),
  });

  return settings?.logo || null;
}

export async function removeOrganizationLogo() {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Get organization record first
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org?.id) {
    throw new Error("Organization not found");
  }

  // Update logo to null/empty in database
  await db
    .update(organizationSettings)
    .set({
      logo: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationSettings.organizationId, orgId));

  revalidatePath("/admin/settings");
}
