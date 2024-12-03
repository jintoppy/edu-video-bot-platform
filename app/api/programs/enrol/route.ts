import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { studentProfiles, programs, chatSessions, programEnrollmentRequests } from "@/lib/db/schema";

// Get enrollment requests for the current user
export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const enrollmentRequests = await db.query.programEnrollmentRequests.findMany({
      where: eq(programEnrollmentRequests.studentId, authResult.user.id),
      with: {
        program: true,
      },
    });

    return NextResponse.json({ enrollmentRequests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching enrollment requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment requests" },
      { status: 500 }
    );
  }
}

// Create a new enrollment request
export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const { programId, notes } = await req.json();

    // Validate program exists
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, programId),
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Check if user already has a pending request for this program
    const existingRequest = await db.query.programEnrollmentRequests.findFirst({
      where: and(
        eq(programEnrollmentRequests.programId, programId),
        eq(programEnrollmentRequests.studentId, authResult.user.id),
        eq(programEnrollmentRequests.status, "pending")
      ),
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this program" },
        { status: 400 }
      );
    }

    // Create new enrollment request
    const newRequest = await db.insert(programEnrollmentRequests).values({
      programId,
      studentId: authResult.user.id,
      notes,
      status: "pending",
    }).returning();

    return NextResponse.json({ request: newRequest[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating enrollment request:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment request" },
      { status: 500 }
    );
  }
}
