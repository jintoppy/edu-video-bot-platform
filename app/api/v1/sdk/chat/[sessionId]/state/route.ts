import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ChatSessionMetadata } from "@/types/chat";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await req.json();

    const session = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId),
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
      });
    }

    // Update session with new metadata
    await db
      .update(chatSessions)
      .set({
        updatedAt: new Date(),
        metadata: {
          ...session.metadata,
          lastActive: body.lastActive,
        } as ChatSessionMetadata,
      })
      .where(eq(chatSessions.id, sessionId));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Save state error:", error);
    return new Response(JSON.stringify({ error: "Failed to save state" }), {
      status: 500,
    });
  }
}
