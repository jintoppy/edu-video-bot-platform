// src/app/api/v1/sdk/chat/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys, chatSessions, chatMessages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { chatAction } from '@/app/actions/graph';
import { createStreamableUI } from 'ai/rsc';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), { 
        status: 401 
      });
    }

    // Verify API key and get organization
    const keyDetails = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        organization: true
      }
    });

    if (!keyDetails?.organization?.id) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), { 
        status: 401 
      });
    }

    const body = await req.json();
    const { message, sessionId, messages = [], metadata = {} } = body;

    // Get or create session
    let chatSessionId = sessionId;
    if (!chatSessionId) {
      const [session] = await db.insert(chatSessions).values({
        studentId: metadata.userId,
        communicationMode: "text_only",
        category: "general_query",
        startTime: new Date(),
        status: "active",
        metadata: {
          ...metadata,
          organizationId: keyDetails.organization.id
        }
      }).returning({ id: chatSessions.id });
      chatSessionId = session.id;
    }

    // Create UI stream
    const uiStream = createStreamableUI();

    // Process chat
    const result = await chatAction(
      messages,
      message,
      metadata.userId,
      uiStream,
      chatSessionId
    );

    // Return response with streaming capability
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial session info
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'session',
          sessionId: chatSessionId
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

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500 
    });
  }
}