"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, ExternalLink, Menu } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminNavItem } from "@/components/admin/nav";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AdminInfo } from "@/lib/auth";

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CarFront className="size-4" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-sm font-semibold">AK Cabs</span>
        <span className="block text-xs text-muted-foreground">Admin</span>
      </span>
    </Link>
  );
}

function SidebarFooter({ admin }: { admin: AdminInfo }) {
  return (
    <div className="mt-auto shrink-0 space-y-2 border-t border-border p-3">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        View site
      </Link>
      <div className="rounded-lg bg-muted/60 px-3 py-2">
        <p className="truncate text-sm font-medium">{admin.name}</p>
        <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
      </div>
      <LogoutButton className="w-full" />
    </div>
  );
}

function AdminShell({
  admin,
  children,
}: {
  admin: AdminInfo;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = getAdminNavItem(pathname);

  return (
    <div className="flex min-h-svh bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <Brand />
        <AdminNav />
        <SidebarFooter admin={admin} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open navigation"
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "lg:hidden")}
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin navigation</SheetTitle>
              </SheetHeader>
              <Brand onNavigate={() => setMobileOpen(false)} />
              <AdminNav onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter admin={admin} />
            </SheetContent>
          </Sheet>

          <p className="truncate font-heading text-sm font-semibold">
            {current.label}
          </p>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <LogoutButton className="lg:hidden" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export { AdminShell };
