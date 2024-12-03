import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSessions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";

export async function GET() {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const conversations = await db
      .select({
        id: chatSessions.id,
        studentId: chatSessions.studentId,
        communicationMode: chatSessions.communicationMode,
        category: chatSessions.category,
        startTime: chatSessions.startTime,
        endTime: chatSessions.endTime,
        summary: chatSessions.summary,
        status: chatSessions.status,
        user: {
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(chatSessions)
      .leftJoin(users, eq(chatSessions.studentId, users.id))
      .orderBy(chatSessions.startTime);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
