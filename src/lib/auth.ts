import { ConvexHttpClient } from "convex/browser";

export type AdminInfo = {
  name: string;
  email: string;
};

export function getConvexUrl(): string {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("CONVEX_URL is not configured");
  }
  return url;
}

export function convexClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl());
}

export function toAdminInfo(user: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): AdminInfo {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email;
  return { name, email: user.email };
}

/**
 * Returns a Convex client already authenticated as the signed-in WorkOS user,
 * for server-side queries/mutations in Server Components and Route Handlers.
 * Callers must have already ensured a session (e.g. `withAuth({ ensureSignedIn: true })`).
 */
export async function authedConvexClient(
  accessToken: string,
): Promise<ConvexHttpClient> {
  const client = convexClient();
  client.setAuth(accessToken);
  return client;
}
