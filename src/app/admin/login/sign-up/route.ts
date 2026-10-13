import { redirect } from "next/navigation";
import { getSignUpUrl } from "@workos-inc/authkit-nextjs";

// Mirrors sign-in/route.ts — the PKCE cookie can only be written from a Route
// Handler. Remove this route (and its link in LoginForm) if you do not want
// self-service sign-up.
export async function GET() {
  const signUpUrl = await getSignUpUrl({ returnTo: "/admin" });
  return redirect(signUpUrl);
}
