import { cookies } from "next/headers";
import { anyApi } from "convex/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { convexClient } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    try {
      await convexClient().mutation(anyApi.auth.logout, { token });
    } catch {
      // The local cookie is cleared regardless of whether the session
      // could be revoked on the backend.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}