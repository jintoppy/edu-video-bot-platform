// src/middleware/sdk-cors.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function sdkCorsMiddleware(request: NextRequest) {
  // Only handle SDK API routes
  if (!request.nextUrl.pathname.startsWith('/api/v1/sdk')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  
  // If no origin, might be a direct API call
  if (!origin) {
    return NextResponse.next();
  }

  // Get API key from headers
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return new NextResponse(null, {
      status: 401,
      statusText: 'Missing API key'
    });
  }

  try {
    // Check if API key exists and get allowed domains
    const keyDetails = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey)
    });

    if (!keyDetails) {
      return new NextResponse(null, {
        status: 401,
        statusText: 'Invalid API key'
      });
    }

    // Check if domain is allowed
    const allowedDomains = keyDetails.allowedDomains as string[];
    const isAllowedDomain = allowedDomains.some(domain => {
      if (domain === '*') return true;
      if (domain.startsWith('*.')) {
        const wildCardDomain = domain.slice(2);
        return origin.endsWith(wildCardDomain);
      }
      return origin === domain;
    });

    if (!isAllowedDomain) {
      return new NextResponse(null, {
        status: 403,
        statusText: 'Domain not allowed'
      });
    }

    // Create response and set CORS headers
    const response = NextResponse.next();

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  } catch (error) {
    console.error('SDK CORS middleware error:', error);
    return new NextResponse(null, {
      status: 500,
      statusText: 'Internal server error'
    });
  }
}

// Handle OPTIONS requests
export function handleOptions(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Only handle SDK routes
  if (!request.nextUrl.pathname.startsWith('/api/v1/sdk')) {
    return NextResponse.next();
  }

  if (origin) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  return NextResponse.next();
}