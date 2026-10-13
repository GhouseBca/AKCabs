import { LogIn, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Plain <a> (not next/link) so these route handlers are never prefetched.
// The Route Handlers call getSignInUrl()/getSignUpUrl(), which write the PKCE
// cookie and are therefore not allowed to run during render.
export function LoginForm() {
  return (
    <div className="flex flex-col gap-3">
      <a
        href="/admin/login/sign-in"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        <LogIn className="size-4" aria-hidden="true" />
        Sign in with WorkOS
      </a>
      <a
        href="/admin/login/sign-up"
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "w-full",
        )}
      >
        <UserPlus className="size-4" aria-hidden="true" />
        Create an account
      </a>
    </div>
  );
}
