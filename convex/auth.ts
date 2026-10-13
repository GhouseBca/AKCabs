import { internalMutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * The `admins` table is an allowlist of WorkOS users who may access the admin
 * area. A user is authorized when their WorkOS identity email matches an
 * `admins` row.
 */

/**
 * Reads the authenticated WorkOS identity from the request and ensures the
 * caller's email exists as an active admin. Throws "Not authenticated" when
 * there is no identity (or no `email` claim) and "Not authorized" otherwise.
 *
 * Call this at the top of any protected Convex function. The identity is
 * derived server-side from the verified JWT; never accept an email or user id
 * as a function argument for authorization.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  if (!identity.email) {
    throw new Error(
      "Not authenticated: the WorkOS access token is missing an `email` claim. Add an `email` claim to the WorkOS JWT template (Authentication → JWT template).",
    );
  }

  const email = identity.email.trim().toLowerCase();

  const indexed = await ctx.db
    .query("admins")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();

  // The by_email index is case-sensitive; fall back to a normalized comparison
  // in case the stored row wasn't already lowercased.
  const admin =
    indexed ??
    (await ctx.db.query("admins").collect()).find(
      (row) => row.email.trim().toLowerCase() === email,
    );

  if (!admin || admin.active !== true) {
    throw new Error("Not authorized");
  }

  return admin;
}

/**
 * Creates (or reactivates) an admin whose email matches a WorkOS user. Run
 * once to bootstrap the allowlist:
 *
 *   npx convex run auth:setupAdmin '{"email":"you@example.com","name":"Ghouse"}'
 *
 * When `email` is omitted, `ADMIN_EMAIL` from the deployment environment is
 * used instead.
 */
export const setupAdmin = internalMutationGeneric({
  args: { email: v.optional(v.string()), name: v.optional(v.string()) },
  handler: async (ctx, { email, name }) => {
    const resolvedEmail = (email ?? process.env.ADMIN_EMAIL ?? "")
      .trim()
      .toLowerCase();
    if (!resolvedEmail) {
      throw new Error(
        "Provide an email argument or set the ADMIN_EMAIL environment variable.",
      );
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", resolvedEmail))
      .first();

    if (existing) {
      await ctx.db.patch("admins", existing._id, {
        name: name?.trim() || existing.name,
        active: true,
        updatedAt: now,
      });
      return { created: false, email: resolvedEmail };
    }

    await ctx.db.insert("admins", {
      name: name?.trim() || "Admin",
      email: resolvedEmail,
      role: "admin",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    return { created: true, email: resolvedEmail };
  },
});
