// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/', 
  '/api/webhooks', 
  '/counselor/signup',
  '/org-onboarding',
  '/org/:subdomain'
]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Skip subdomain check for assets and API routes
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Handle subdomain routing for organizations
  if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost:3000') {
    // Rewrite URL for organization-specific pages
    // This will route to a catch-all page that handles org-specific content
    const newUrl = new URL(`/org/${subdomain}${url.pathname}`, request.url);
    return NextResponse.rewrite(newUrl);
  }

  const isPublic = isPublicRoute(request);

  // Protect non-public routes with authentication
  if (!isPublic) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};