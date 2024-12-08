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

    return new Response(JSON.stringify({ data: "trial" }), { 
      status: 200 
    });

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

    // Validate API key and get organization
    const keyDetails = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        organization: true
      }
    });

    if (!keyDetails?.organization?.id) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), { 
        status: 401 
      });
    }

    const body = await req.json();
    const { programId, metadata = {} } = body;

    // Get organization settings for theme
    const settings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organizationId, keyDetails.organization.id)
    });

    // Create new chat session
    const [session] = await db.insert(chatSessions).values({
      studentId: metadata.userId || null,
      communicationMode: "text_only",
      category: "general_query",
      startTime: new Date(),
      status: "active",
      programId: programId || null,
      metadata: {
        organizationId: keyDetails.organization.id,
        source: metadata.source || 'sdk',
        ...metadata
      } as ChatSessionMetadata
    }).returning({ id: chatSessions.id });

    // Track API key usage
    await db.insert(apiKeyUsage).values({
      apiKeyId: keyDetails.id,
      sessionId: session.id,
      domain: metadata.domain || '',
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    });

    return new Response(JSON.stringify({
      data: {
        sessionId: session.id,
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