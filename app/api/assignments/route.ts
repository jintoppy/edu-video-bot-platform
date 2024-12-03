import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isNull, eq } from "drizzle-orm";
import { counselorAssignments, users, programs, chatSessions } from "@/lib/db/schema";
import { checkAuth } from "@/lib/checkAuth";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  console.log('authResult', authResult)

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    console.log('status', status)

    const assignments = await db
      .select({
        id: counselorAssignments.id,
        createdAt: counselorAssignments.createdAt,
        status: counselorAssignments.status,
        userFullName: users.fullName,
        userEmail: users.email,
        programName: programs.name,
        programLevel: programs.level,
        chatSessionId: chatSessions.id,
        chatSessionSummary: chatSessions.summary,
        chatSessionStartTime: chatSessions.startTime,
      })
      .from(counselorAssignments)
      .leftJoin(users, eq(counselorAssignments.studentId, users.id))
      .leftJoin(programs, eq(counselorAssignments.programId, programs.id))
      .leftJoin(chatSessions, eq(counselorAssignments.conversationId, chatSessions.id))
      .where(isNull(counselorAssignments.counselorId));

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
