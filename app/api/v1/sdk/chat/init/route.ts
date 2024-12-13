// src/app/api/v1/sdk/chat/init/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiKeys, apiKeyUsage, chatSessions, organizations, organizationSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ChatSessionMetadata } from "@/types/chat";
import { validateApiKeyAndDomain } from "@/lib/api-validation";

export async function POST(req: NextRequest) {
  try {
    
    const apiKey = req.headers.get("X-API-Key");    

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), { 
        status: 401 
      });
    }

    const origin = req.headers.get('origin');
    const validation = await validateApiKeyAndDomain(apiKey, origin);

    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), { 
        status: validation.status 
      });
    }


    if (!validation?.key?.organizationId) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), { 
        status: 401 
      });
    }

    const body = await req.json();
    const { programId, sessionId, metadata = {} } = body;

    // Get organization settings for theme
    const settings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organizationId, validation.key.organizationId)
    });

    // Create new chat session
    const [session] = await db.insert(chatSessions).values({
      communicationMode: "text_only",
      category: "general_query",
      startTime: new Date(),
      status: "active",
      uiSessionId: sessionId,
      programId: programId || null,
      metadata: {
        organizationId: validation.key.organizationId,
        source: metadata.source || 'sdk',
        ...metadata
      } as ChatSessionMetadata
    }).returning({ id: chatSessions.id });

    // Track API key usage
    await db.insert(apiKeyUsage).values({
      apiKeyId: validation.key.id,
      sessionId: session.id,
      domain: metadata.domain || '',
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    });

    return new Response(JSON.stringify({
      data: {
        sessionId: session.id,
        orgId: validation.key.organizationId,
        settings: {
          theme: settings?.theme || {
            primaryColor: "#3B82F6",
            secondaryColor: "#10B981",
            accentColor: "#6366F1",
            fontFamily: "Inter"
          },
          features: settings?.features || {
            videoBot: true,
            liveChat: true
          }
        }
      }
    }), { status: 200 });

  } catch (error) {
    console.error("Chat init error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500 
    });
  }
}