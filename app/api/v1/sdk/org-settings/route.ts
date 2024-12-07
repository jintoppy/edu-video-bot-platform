import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys, organizationSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }), 
        { status: 401 }
      );
    }

    // Get organization ID from API key
    const keyDetails = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        organization: true
      }
    });

    if (!keyDetails?.organization?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }), 
        { status: 401 }
      );
    }

    // Get organization settings
    const settings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organizationId, keyDetails.organization.id)
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