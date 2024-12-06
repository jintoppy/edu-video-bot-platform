import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { landingPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/auth/utils";

export async function GET() {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    // Get organization ID from authenticated user
    const orgId = authResult.user.organizationId;
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 400 }
      );
    }

    // Fetch landing page configuration
    const landingPage = await db.query.landingPages.findFirst({
      where: eq(landingPages.organizationId, orgId),
    });

    return NextResponse.json(landingPage || { sections: [], isPublished: false });
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing page configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const { sections, isPublished } = await req.json();
    const orgId = authResult.user.organizationId;

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 400 }
      );
    }

    // Find existing landing page
    const existingPage = await db.query.landingPages.findFirst({
      where: eq(landingPages.organizationId, orgId),
    });

    if (existingPage) {
      // Update existing landing page
      await db
        .update(landingPages)
        .set({
          sections,
          isPublished,
          updatedAt: new Date(),
          publishedAt: isPublished ? new Date() : null,
        })
        .where(eq(landingPages.id, existingPage.id));
    } else {
      // Create new landing page
      await db.insert(landingPages).values({
        organizationId: orgId,
        sections,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving landing page:", error);
    return NextResponse.json(
      { error: "Failed to save landing page configuration" },
      { status: 500 }
    );
  }
}
