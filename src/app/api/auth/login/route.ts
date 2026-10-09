import { anyApi } from "convex/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { convexClient } from "@/lib/auth";

export async function POST(request: Request) {
  let email: string;
  let password: string;
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim().toLowerCase();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const result = await convexClient().mutation(anyApi.auth.login, {
      email,
      password,
    });
    const response = NextResponse.json({ ok: true, admin: result.admin });
    response.cookies.set({
      name: AUTH_COOKIE,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password" },
      { status: 401 },
    );
  }
}