import { NextRequest } from "next/server";
import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * - Runs on /admin/* and /api/* so the WorkOS session is read/refreshed
 *   everywhere withAuth() might be called (pages, layouts, route handlers).
 * - Only /admin/* requires sign-in. /api/* stays public unless your own
 *   route handlers check the user themselves.
 * - /admin/login and its sign-in/sign-up route handlers stay reachable
 *   while logged out, otherwise we'd loop.
 * - /callback is intentionally outside the matcher.
 */
const UNAUTHENTICATED_PREFIXES = ["/admin/login"];

export default async function proxy(request: NextRequest) {
  const { session, headers, authorizationUrl } = await authkit(request, {
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  });

  const { pathname } = request.nextUrl;

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAdminPath = UNAUTHENTICATED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isAdminPath && !isPublicAdminPath && !session.user && authorizationUrl) {
    return handleAuthkitHeaders(request, headers, {
      redirect: authorizationUrl,
    });
  }

  return handleAuthkitHeaders(request, headers);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};