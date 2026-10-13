import { redirect } from "next/navigation";
import { getSignInUrl } from "@workos-inc/authkit-nextjs";

// getSignInUrl() writes the PKCE cookie, which is only allowed in a Route
// Handler or Server Action (never during render/prerender). This route handler
// mints the WorkOS authorization URL and sends the browser to it. It is dynamic
// automatically because getSignInUrl() reads/writes cookies.
export async function GET() {
  const signInUrl = await getSignInUrl({ returnTo: "/admin" });
  return redirect(signInUrl);
}
