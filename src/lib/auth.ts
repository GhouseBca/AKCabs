import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { AUTH_COOKIE } from "./auth/constants";

export type AdminInfo = {
  name: string;
  email: string;
  role: string;
};

export function getConvexUrl(): string {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("CONVEX_URL is not configured");
  }
  return url;
}

export function convexClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl());
}

export type AdminSession = {
  admin: AdminInfo;
  token: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const admin = await convexClient().query(anyApi.auth.me, { token });
    if (!admin) {
      return null;
    }
    return { admin, token };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminInfo | null> {
  const session = await getAdminSession();
  return session?.admin ?? null;
}