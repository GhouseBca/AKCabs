"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";

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

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl, { logger }) : null,
  );

  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
