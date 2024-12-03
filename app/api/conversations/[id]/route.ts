import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSessions, counselorAssignments, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }
  const conversationId = (await params).id;

  if(!conversationId){
    return NextResponse.json({error: 'No Conversation found'}, { status: 404 });
  }

  console.log('conversationId', conversationId);

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
        assignment: {
          counselorId: counselorAssignments.counselorId,
          status: counselorAssignments.status,
        }
      })
      .from(chatSessions)
      .leftJoin(users, eq(chatSessions.studentId, users.id))
      .leftJoin(counselorAssignments, eq(chatSessions.id, counselorAssignments.conversationId))
      .where(eq(chatSessions.id, conversationId))
      .orderBy(chatSessions.startTime);

    const response = conversations.length > 0 ? conversations[0] : null;
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
