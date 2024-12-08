// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sdkCorsMiddleware, handleOptions } from './sdk-middleware';


const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/', 
  '/api/webhooks', 
  '/counselor/signup',
  '/org-onboarding',
  '/org/:subdomain',
  '/org/:subdomain/programs',
  '/api/programs',
  '/api/v1/sdk/(.*)',
  '/sdk/embedded-chat'
]);

async function handleRequest(auth: any, request: NextRequest) {

  const isPublic = isPublicRoute(request);

  console.log('request.url', request.url);
  console.log('isPublic', isPublic)
  console.log('request.nextUrl.pathname', request.nextUrl.pathname)

  if (request.nextUrl.pathname.startsWith('/api/v1/sdk') || 
  request.nextUrl.pathname === '/sdk/embedded-chat') {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    return sdkCorsMiddleware(request);
  }

  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Skip subdomain check for assets and non-SDK API routes
  if (
    url.pathname.startsWith('/_next') || 
    (url.pathname.startsWith('/api') && !url.pathname.startsWith('/api/v1/sdk')) ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Handle subdomain routing for organizations
  if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost:3000') {
    const newUrl = new URL(`/org/${subdomain}${url.pathname}`, request.url);
    return NextResponse.rewrite(newUrl);
  }  

  // Protect non-public routes with authentication
  if (!isPublic) {
    await auth.protect();
  }

  return NextResponse.next();
}

export default clerkMiddleware((auth, request) => handleRequest(auth, request));


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/sdk/embedded-chat'
  ],
};