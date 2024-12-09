import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chatAction } from "@/app/actions/graph";
import { createStreamableUI } from "ai/rsc";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, message, metadata = {} } = body;

    // Validate session
    const session = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId)
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { 
        status: 404 
      });
    }

    // Get previous messages
    const previousMessages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, sessionId),
      orderBy: (messages, { asc }) => [asc(messages.timestamp)]
    });

    // Create serialized messages
    const serializedMessages = previousMessages.map(msg => ({
      role: msg.messageType === "user_message" ? "user" : "assistant" as "user" | "assistant",
      content: msg.content,
      id: msg.id,
      sessionId
    }));

    // Process message through chat graph
    const result = await chatAction(serializedMessages, message, metadata.userId);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial session info
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'session',
          sessionId: sessionId
        }) + '\n'));

        // Send message updates
        if (result?.resultPromise) {
          const chatResult = await result.resultPromise;
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'message',
            content: chatResult
          }) + '\n'));
        }

        // Send UI updates
        if (result?.serverUi) {
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'ui',
            content: result.serverUi
          }) + '\n'));
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Return response
    // return new Response(JSON.stringify({
    //   data: {
    //     message: result.resultPromise,
    //     sessionId,
    //     ui: result.serverUi
    //   }
    // }), { status: 200 });

  } catch (error) {
    console.error("Chat message error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500 
    });
  }
}