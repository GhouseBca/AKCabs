import type { Metadata } from "next";
import Link from "next/link";
import { CarFront } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4 focus:outline-none"
    >
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CarFront className="size-5" aria-hidden="true" />
        </span>
        <span className="font-heading text-lg font-semibold tracking-tight">
          AK Cabs
        </span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Sign in with your WorkOS account to manage cars, pricing, enquiries,
            and site settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        © 2026 AK Cabs Tirunelveli
      </p>
    </main>
  );
}
