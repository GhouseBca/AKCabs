import { NextRequest } from "next/server";
import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * - Runs on every page (except static files and /callback) so withAuth() and
 *   AuthKitProvider's server actions work on public pages too.
 * - Only /admin/* requires sign-in. The rest of the site stays public.
 * - /admin/login and its sign-in/sign-up route handlers stay reachable while
 *   logged out, otherwise we'd loop.
 */
const PUBLIC_ADMIN_PREFIXES = ["/admin/login"];

export default async function proxy(request: NextRequest) {
  const { session, headers, authorizationUrl } = await authkit(request, {
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  });

  const { pathname } = request.nextUrl;

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAdminPath = PUBLIC_ADMIN_PREFIXES.some(
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|callback|.*\\..*).*)"],
};