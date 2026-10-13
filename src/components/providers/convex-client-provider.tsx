"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos-inc/authkit-nextjs/components";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Convex's default logger calls `Math.random()` while registering its console
// listener, which Next.js forbids during prerendering (Cache Components). A
// plain console logger avoids that while still forwarding client-side logs.
const logger = {
  logVerbose: (...args: unknown[]) => console.debug(...args),
  log: (...args: unknown[]) => console.log(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};

// Bridges WorkOS AuthKit into the `useAuth` shape Convex expects. The user is
// authenticated once AuthKit finishes loading, and the WorkOS access token is
// the JWT Convex verifies (see convex/auth.config.ts).
function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { getAccessToken } = useAccessToken();

  // Keep the token fetcher referentially stable. Convex re-registers auth
  // whenever `fetchAccessToken` changes identity, which briefly resets its auth
  // state and unmounts authenticated subtrees (the admin "blink").
  const fetchAccessToken = useCallback(
    async () => (await getAccessToken()) ?? null,
    [getAccessToken],
  );

  return { isLoading, user, getAccessToken: fetchAccessToken };
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl, { logger }) : null,
  );

  if (!client) {
    return <>{children}</>;
  }

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuthKit client={client} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuthKit>
    </AuthKitProvider>
  );
}
