import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminShellSkeleton } from "@/components/admin/AdminShellSkeleton";
import { toAdminInfo } from "@/lib/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const instant = false;

// The static shell (skeleton) is prerendered; only this subtree suspends. Reading
// the AuthKit session (iron-session) touches `Date.now()`, which Next.js rejects
// during prerender under Cache Components, so the session read is isolated behind
// `<Suspense>` and forced to request time with `connection()`.
async function AdminDashboardContent({ children }: { children: ReactNode }) {
  await connection();

  const { user } = await withAuth({ ensureSignedIn: true });

  return <AdminShell admin={toAdminInfo(user)}>{children}</AdminShell>;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminDashboardContent>{children}</AdminDashboardContent>
    </Suspense>
  );
}
