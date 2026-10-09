import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";
import { pricingCategory } from "./schema";

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

function cleanNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  if (value < 0) {
    throw new Error(`${field} cannot be negative`);
  }
  return value;
}

function cleanNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be a whole number`);
  }
  if (value < 0) {
    throw new Error(`${field} cannot be negative`);
  }
  return value;
}

function assertUniqueIdList(ids: string[], label: string): void {
  if (ids.length === 0) {
    throw new Error(`${label} list cannot be empty`);
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} list contains duplicate ids`);
  }
}

type PricingInput = {
  title?: string;
  category?: "local" | "outstation" | "airport" | "full_day";
  description?: string;
  price?: number;
  unit?: string;
  notes?: string;
  active?: boolean;
  sortOrder?: number;
};

function sanitizePricingFields(input: PricingInput): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  if (input.title !== undefined) {
    fields.title = cleanText(input.title, "Title", 120);
  }
  if (input.category !== undefined) {
    fields.category = input.category;
  }
  if (input.description !== undefined) {
    fields.description = cleanText(input.description, "Description", 2000, false);
  }
  if (input.price !== undefined) {
    fields.price = cleanNonNegativeNumber(input.price, "Price");
  }
  if (input.unit !== undefined) {
    fields.unit = cleanText(input.unit, "Unit", 60);
  }
  if (input.notes !== undefined) {
    fields.notes = cleanText(input.notes, "Notes", 1000, false);
  }
  if (input.active !== undefined) {
    fields.active = input.active;
  }
  if (input.sortOrder !== undefined) {
    fields.sortOrder = cleanNonNegativeInteger(input.sortOrder, "Sort order");
  }

  return fields;
}

const pricingFields = {
  title: v.string(),
  category: pricingCategory,
  description: v.string(),
  price: v.optional(v.number()),
  unit: v.string(),
  notes: v.string(),
  active: v.boolean(),
  sortOrder: v.optional(v.number()),
};

const pricingUpdateFields = {
  title: v.optional(v.string()),
  category: v.optional(pricingCategory),
  description: v.optional(v.string()),
  price: v.optional(v.number()),
  unit: v.optional(v.string()),
  notes: v.optional(v.string()),
  active: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
};

/**
 * Public: active pricing entries, optionally filtered by category, ordered
 * for display.
 */
export const getActivePricing = queryGeneric({
  args: { category: v.optional(pricingCategory) },
  handler: async (ctx, { category }) => {
    const rows = await ctx.db
      .query("pricing")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const filtered = category
      ? rows.filter((row) => row.category === category)
      : rows;
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Admin: every pricing entry including inactive ones, ordered for display.
 */
export const getPricing = queryGeneric({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("pricing")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});

export const createPricing = mutationGeneric({
  args: { token: v.string(), ...pricingFields },
  handler: async (ctx, { token, ...input }) => {
    await requireAdmin(ctx, token);

    const fields = sanitizePricingFields(input);
    const now = Date.now();

    if (fields.sortOrder === undefined) {
      const last = await ctx.db
        .query("pricing")
        .withIndex("by_sort_order")
        .order("desc")
        .first();
      fields.sortOrder = last ? last.sortOrder + 1 : 1;
    }

    return await ctx.db.insert("pricing", {
      ...fields,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePricing = mutationGeneric({
  args: { token: v.string(), id: v.id("pricing"), ...pricingUpdateFields },
  handler: async (ctx, { token, id, ...input }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("pricing", id);
    if (!existing) {
      throw new Error("Pricing entry not found");
    }

    const fields = sanitizePricingFields(input);
    if (Object.keys(fields).length === 0) {
      throw new Error("No changes provided");
    }

    await ctx.db.patch("pricing", id, { ...fields, updatedAt: Date.now() });
    return id;
  },
});

export const deletePricing = mutationGeneric({
  args: { token: v.string(), id: v.id("pricing") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("pricing", id);
    if (!existing) {
      throw new Error("Pricing entry not found");
    }

    await ctx.db.delete("pricing", id);
    return { deleted: id };
  },
});

/**
 * Admin: reorder pricing entries by passing the full list of ids in the
 * desired order. sortOrder is rewritten to match the array position.
 */
export const reorderPricing = mutationGeneric({
  args: { token: v.string(), ids: v.array(v.id("pricing")) },
  handler: async (ctx, { token, ids }) => {
    await requireAdmin(ctx, token);
    assertUniqueIdList(ids, "Pricing");

    const now = Date.now();
    for (let index = 0; index < ids.length; index++) {
      const row = await ctx.db.get("pricing", ids[index]);
      if (!row) {
        throw new Error(`Pricing entry not found: ${ids[index]}`);
      }
    }
    for (let index = 0; index < ids.length; index++) {
      await ctx.db.patch("pricing", ids[index], {
        sortOrder: index + 1,
        updatedAt: now,
      });
    }

    return { updated: ids.length };
  },
});
