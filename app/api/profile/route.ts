import { db } from "@/lib/db";
import { studentProfiles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/checkAuth";

export async function GET() {
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, authResult.user.id)
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const data = await req.json();
    
    // Check if profile exists
    const existingProfile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, authResult.user.id)
    });

    if (existingProfile) {
      // Update existing profile
      await db
        .update(studentProfiles)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(studentProfiles.userId, authResult.user.id));
    } else {
      // Create new profile
      await db.insert(studentProfiles).values({
        userId: authResult.user.id,
        ...data
      });
    }

    return new NextResponse("Profile updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
