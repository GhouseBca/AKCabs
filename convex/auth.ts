import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * The only account allowed to access the admin area. Any other email or
 * password is rejected, and any session belonging to a different admin is
 * refused by `requireAdmin`.
 */
export const ALLOWED_ADMIN_EMAIL = "md.ghouse.dev@gmail.com";
const ALLOWED_ADMIN_PASSWORD = "Ghouse@2603";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH_BYTES = 32;
const PBKDF2_FORMAT = "pbkdf2_sha256";
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    PBKDF2_KEY_LENGTH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `${PBKDF2_FORMAT}$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [format, iterations, saltB64, hashB64] = stored.split("$");
  const iterationCount = Number(iterations);
  if (
    format !== PBKDF2_FORMAT ||
    !Number.isSafeInteger(iterationCount) ||
    iterationCount <= 0 ||
    !saltB64 ||
    !hashB64
  ) {
    return false;
  }
  const actual = await deriveKey(password, base64ToBytes(saltB64), iterationCount);
  return timingSafeEqual(actual, base64ToBytes(hashB64));
}

function newSessionToken(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validates a session token and returns the associated active admin.
 * Throws "Unauthorized" if the token is missing, unknown, expired, or the
 * admin is disabled. Call this at the top of any protected Convex function.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  token: string | undefined,
) {
  if (!token) {
    throw new Error("Unauthorized");
  }
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }
  const admin = await ctx.db.get("admins", session.adminId);
  if (!admin || !admin.active || admin.email !== ALLOWED_ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return admin;
}

export async function createSession(
  ctx: MutationCtx,
  adminId: Id<"admins">,
  now = Date.now(),
): Promise<string> {
  const token = newSessionToken();
  await ctx.db.insert("sessions", {
    adminId,
    token,
    expiresAt: now + SESSION_TTL_MS,
    createdAt: now,
  });
  return token;
}

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail !== ALLOWED_ADMIN_EMAIL ||
      password !== ALLOWED_ADMIN_PASSWORD
    ) {
      throw new Error("Invalid credentials");
    }

    const now = Date.now();
    let admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!admin) {
      const adminId = await ctx.db.insert("admins", {
        name: "Ghouse",
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        role: "admin",
        active: true,
        createdAt: now,
        updatedAt: now,
      });
      admin = await ctx.db.get("admins", adminId);
    } else if (!admin.active) {
      await ctx.db.patch("admins", admin._id, { active: true, updatedAt: now });
    }

    if (!admin) {
      throw new Error("Invalid credentials");
    }

    const token = await createSession(ctx, admin._id);
    return {
      token,
      admin: { name: admin.name, email: admin.email, role: admin.role },
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    try {
      const admin = await requireAdmin(ctx, token);
      return { name: admin.name, email: admin.email, role: admin.role };
    } catch {
      return null;
    }
  },
});

/**
 * Creates (or updates) the single allowed admin account. Run once via:
 *   npx convex run auth:setupAdmin
 */
export const setupAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const normalizedEmail = ALLOWED_ADMIN_EMAIL;
    const password = ALLOWED_ADMIN_PASSWORD;
    const now = Date.now();
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      await ctx.db.patch("admins", existing._id, {
        passwordHash: await hashPassword(password),
        active: true,
        updatedAt: now,
      });
      return { created: false, email: normalizedEmail };
    }

    await ctx.db.insert("admins", {
      name: "Ghouse",
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role: "admin",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    return { created: true, email: normalizedEmail };
  },
});