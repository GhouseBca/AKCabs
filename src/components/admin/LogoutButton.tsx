"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut({ returnTo: "/admin/login" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(className)}
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
