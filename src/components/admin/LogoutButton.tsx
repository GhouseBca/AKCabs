"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
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
