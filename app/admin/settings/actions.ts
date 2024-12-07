"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizationSettings, organizations, apiKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { put } from "@vercel/blob";
import { clerkClient } from "@/lib/clerk";
import { randomUUID } from "crypto";

interface ThemeUpdate {
  primary: string;
  secondary: string;
}

interface ApiKeyCreate {
  name: string;
  allowedDomains?: string[];
  allowedIps?: string[];
  monthlyQuota?: number;
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

export async function updateOrganizationLogo(formData: FormData) {
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

export async function getOrganizationDetails() {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  return {
    name: org.name,
    subdomain: org.subdomain,
    email: org.email,
    phone: org.phone || '',
    address: org.address || '',
  };
}

export async function updateOrganizationDetails(details: {
  name: string;
  subdomain: string;
  phone: string;
  address: string;
}) {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Check if subdomain is already taken by another organization
  const existingOrg = await db.query.organizations.findFirst({
    where: eq(organizations.subdomain, details.subdomain),
  });

  if (existingOrg && existingOrg.id !== orgId) {
    throw new Error("Subdomain is already taken");
  }

  await db
    .update(organizations)
    .set({
      name: details.name,
      subdomain: details.subdomain,
      phone: details.phone,
      address: details.address,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  // Update the Clerk organization name to keep it in sync
  await clerkClient.organizations.updateOrganization(clerkOrgId, {
    name: details.name,
  });

  revalidatePath("/admin/settings");
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

export async function createApiKey(data: ApiKeyCreate) {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Generate a random API key with prefix
  const prefix = "EDU";
  const randomKey = randomUUID().replace(/-/g, "");
  const key = `${prefix}_${randomKey}`;

  // Insert the new API key
  const [newKey] = await db.insert(apiKeys).values({
    organizationId: orgId,
    name: data.name,
    key: key, // In production, you should hash this
    prefix: `${prefix}_****`,
    allowedDomains: data.allowedDomains,
    allowedIps: data.allowedIps,
    monthlyQuota: data.monthlyQuota,
    createdBy: userId,
    updatedBy: userId,
  }).returning();

  revalidatePath("/admin/settings");

  return {
    ...newKey,
    key // Return the full key only once
  };
}

export async function getApiKeys() {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Get all API keys for the organization
  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.organizationId, orgId),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
  });

  return keys;
}

export async function deleteApiKey(keyId: string) {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!clerkOrgId || !userId) {
    throw new Error("Not authenticated or no organization");
  }

  const clerkOrg = await clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

  const orgId = clerkOrg.privateMetadata.orgId as string;

  // Delete the API key
  await db.delete(apiKeys)
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.organizationId, orgId)
      )
    );

  revalidatePath("/admin/settings");
}
