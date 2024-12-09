import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { chatSessions, chatMessages } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";

// End session
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  if (req.url.endsWith('/end')) {
    try {
      await db.update(chatSessions)
        .set({
          status: "completed",
          endTime: new Date()
        })
        .where(eq(chatSessions.id, sessionId));

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error("End session error:", error);
      return new Response(JSON.stringify({ error: "Failed to end session" }), { 
        status: 500 
      });
    }
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// Validate session
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  if (req.url.endsWith('/validate')) {
    try {
      const session = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, sessionId)
      });

      return new Response(JSON.stringify({ 
        data: !!session && session.status === "active" 
      }), { status: 200 });
    } catch (error) {
      console.error("Validate session error:", error);
      return new Response(JSON.stringify({ error: "Failed to validate session" }), { 
        status: 500 
      });
    }
  }

  // Get session history
  if (req.url.includes('/history')) {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const before = url.searchParams.get('before');

      const messages = await db.query.chatMessages.findMany({
        where: and(
          eq(chatMessages.sessionId, sessionId),
          before ? lt(chatMessages.timestamp, new Date(before)) : undefined
        ),
        orderBy: (messages, { desc }) => [desc(messages.timestamp)],
        limit
      });

      return new Response(JSON.stringify({ 
        data: { messages } 
      }), { status: 200 });
    } catch (error) {
      console.error("Get history error:", error);
      return new Response(JSON.stringify({ error: "Failed to get history" }), { 
        status: 500 
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}