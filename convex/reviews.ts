import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";
import { reviewStatus } from "./schema";

const MAX_REVIEWS_PER_PAGE = 200;
const DEFAULT_PUBLIC_LIMIT = 12;
const MAX_PUBLIC_LIMIT = 100;

function cleanText(
  value: string,
  field: string,
  maxLength: number,
  required = true,
): string {
  const trimmed = value.trim();
  if (required && trimmed.length === 0) {
    throw new Error(`${field} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${field} must be at most ${maxLength} characters`);
  }
  return trimmed;
}

function cleanRating(value: number): number {
  if (!Number.isInteger(value)) {
    throw new Error("Rating must be a whole number");
  }
  if (value < 1 || value > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  return value;
}

function cleanLimit(
  value: number | undefined,
  fallback: number,
  max: number,
): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`Limit must be between 1 and ${max}`);
  }
  return value;
}

/**
 * Public: submit a new customer review from the website. New reviews always
 * start as "pending" and only appear on the site once an admin approves them.
 */
export const createReview = mutationGeneric({
  args: {
    name: v.string(),
    rating: v.number(),
    comment: v.string(),
    location: v.optional(v.string()),
  },
  handler: async (ctx, input) => {
    const now = Date.now();
    const location =
      input.location === undefined
        ? ""
        : cleanText(input.location, "Location", 80, false);

    return await ctx.db.insert("reviews", {
      name: cleanText(input.name, "Name", 80),
      rating: cleanRating(input.rating),
      comment: cleanText(input.comment, "Comment", 500),
      location: location.length > 0 ? location : undefined,
      status: "pending",
      createdAt: now,
    });
  },
});

/**
 * Public: approved reviews, newest first, bounded by a limit.
 */
export const getApprovedReviews = queryGeneric({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = cleanLimit(limit, DEFAULT_PUBLIC_LIMIT, MAX_PUBLIC_LIMIT);

    return await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(take);
  },
});

/**
 * Public: average rating and total count across approved reviews.
 */
export const getReviewStats = queryGeneric({
  args: {},
  handler: async (ctx) => {
    let count = 0;
    let total = 0;

    for await (const review of ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))) {
      count += 1;
      total += review.rating;
    }

    return {
      count,
      average: count === 0 ? 0 : total / count,
    };
  },
});

/**
 * Admin: list reviews, newest first, optionally filtered by status.
 */
export const getAllReviews = queryGeneric({
  args: {
    status: v.optional(reviewStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit }) => {
    await requireAdmin(ctx);
    const take = cleanLimit(limit, MAX_REVIEWS_PER_PAGE, MAX_REVIEWS_PER_PAGE);

    if (status) {
      const rows = await ctx.db
        .query("reviews")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      return rows.sort((a, b) => b.createdAt - a.createdAt).slice(0, take);
    }

    return await ctx.db
      .query("reviews")
      .withIndex("by_created_at")
      .order("desc")
      .take(take);
  },
});

export const updateReviewStatus = mutationGeneric({
  args: {
    id: v.id("reviews"),
    status: reviewStatus,
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get("reviews", id);
    if (!existing) {
      throw new Error("Review not found");
    }

    await ctx.db.patch("reviews", id, { status });
    return { id, status };
  },
});

export const deleteReview = mutationGeneric({
  args: { id: v.id("reviews") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get("reviews", id);
    if (!existing) {
      throw new Error("Review not found");
    }

    await ctx.db.delete("reviews", id);
    return { deleted: id };
  },
});
