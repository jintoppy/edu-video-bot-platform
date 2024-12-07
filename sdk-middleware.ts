// src/middleware/sdk-cors.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Create response and set CORS headers
  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
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