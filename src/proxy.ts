import { authkitProxy } from "@workos-inc/authkit-nextjs";

/**
 * Next.js 16 renamed Middleware to Proxy; AuthKit's `authkitProxy` (formerly
 * `authkitMiddleware`) refreshes the WorkOS session and enforces sign-in.
 *
 * Every matched route requires an authenticated WorkOS session, except the
 * paths listed in `unauthenticatedPaths`. The matcher is scoped to `/admin`
 * so the public website stays public.
 */
export default authkitProxy({
  middlewareAuth: {
    enabled: true,
    // path-to-regexp globs (anchored), so each entry is matched exactly.
    // /admin/login/sign-in|sign-up are the Route Handlers that mint the WorkOS
    // authorization URLs; they must be reachable while logged out or we'd loop.
    // /callback is intentionally NOT in this list because it lives outside the
    // matcher below, so the proxy never intercepts it.
    unauthenticatedPaths: [
      "/admin/login",
      "/admin/login/sign-in",
      "/admin/login/sign-up",
    ],
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
