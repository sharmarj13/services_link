import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if session cookie 'sid' exists in the request headers
  const hasSession = request.cookies.has("sid");

  // Define public paths (accessible without login)
  const isPublicPath = 
    path === "/login" || 
    path === "/signup" || 
    path === "/forgot-password" || 
    path === "/";

  // If user has no session and tries to access a protected page, redirect to /login
  if (!hasSession && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Match all protected routes, ignoring static assets and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
