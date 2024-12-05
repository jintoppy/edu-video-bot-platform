'use server';

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizationSettings, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";

interface ThemeUpdate {
  primary: string;
  secondary: string;
}

interface LogoUpdate {
  file: File;
  orgName: string;
}


export async function updateOrganizationTheme(theme: ThemeUpdate) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("Not authenticated or no organization");
  }

  // First, try to update existing settings
  const result = await db
    .update(organizationSettings)
    .set({
      theme: {
        primaryColor: theme.primary,
        secondaryColor: theme.secondary
      },
      updatedAt: new Date()
    })
    .where(eq(organizationSettings.organizationId, orgId))
    .returning();

  // If no settings exist, create them
  if (result.length === 0) {
    await db.insert(organizationSettings).values({
      organizationId: orgId,
      theme: {
        primaryColor: theme.primary,
        secondaryColor: theme.secondary
      }
    });
  }

  revalidatePath("/admin/settings");
}

export async function updateOrganizationLogo({ file, orgName }: LogoUpdate) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("Not authenticated or no organization");
  }

  try {
    // Upload to blob storage
    const filename = `${orgName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    const { url } = await put(`logos/${filename}`, file, { access: 'public' });

    // First, try to update existing settings
    const result = await db
      .update(organizationSettings)
      .set({
        logo: url,
        updatedAt: new Date()
      })
      .where(eq(organizationSettings.organizationId, orgId))
      .returning();

    // If no settings exist, create them
    if (result.length === 0) {
      await db.insert(organizationSettings).values({
        organizationId: orgId,
        logo: url
      });
    }

    revalidatePath("/admin/settings");
    return url;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error('Failed to upload logo');
  }
}

export async function getOrganizationTheme() {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("Not authenticated or no organization");
  }

  const settings = await db.query.organizationSettings.findFirst({
    where: eq(organizationSettings.organizationId, orgId)
  });

  return settings?.theme as { primaryColor: string; secondaryColor: string } | undefined;
}

export async function removeOrganizationLogo() {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("Not authenticated or no organization");
  }

  // Update logo to null/empty in database
  await db
    .update(organizationSettings)
    .set({
      logo: null,
      updatedAt: new Date()
    })
    .where(eq(organizationSettings.organizationId, orgId));

  revalidatePath("/admin/settings");
}
