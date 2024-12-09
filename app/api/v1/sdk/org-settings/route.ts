import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys, organizationSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validateApiKeyAndDomain } from '@/lib/api-validation';

export async function GET(req: NextRequest) {
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
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }), 
        { status: 401 }
      );
    }

    // Get organization settings
    const settings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organizationId, validation.key.organizationId)
    });

    if (!settings) {
      return new Response(
        JSON.stringify({ error: 'Organization settings not found' }), 
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({
      theme: settings.theme,
      features: settings.features
    }), { status: 200 });

  } catch (error) {
    console.error('Error fetching org settings:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}