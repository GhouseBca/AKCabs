import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

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
    throw new Error(`${label} list contains duplicates`);
  }
}

type ServiceInput = {
  title?: string;
  description?: string;
  icon?: string;
  active?: boolean;
  sortOrder?: number;
};

function sanitizeServiceFields(input: ServiceInput): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  if (input.title !== undefined) {
    fields.title = cleanText(input.title, "Title", 120);
  }
  if (input.description !== undefined) {
    fields.description = cleanText(input.description, "Description", 2000, false);
  }
  if (input.icon !== undefined) {
    fields.icon = cleanText(input.icon, "Icon", 60, false);
  }
  if (input.active !== undefined) {
    fields.active = input.active;
  }
  if (input.sortOrder !== undefined) {
    fields.sortOrder = cleanNonNegativeInteger(input.sortOrder, "Sort order");
  }

  return fields;
}

const serviceFields = {
  title: v.string(),
  description: v.string(),
  icon: v.string(),
  active: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
};

const serviceUpdateFields = {
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  active: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
};

/**
 * Public: active services ordered for display.
 */
export const getServices = queryGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.sortOrder - b.sortOrder));
  },
});

/**
 * Admin: every service including inactive ones, ordered for display.
 */
export const getAllServices = queryGeneric({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("services")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});

export const createService = mutationGeneric({
  args: { ...serviceFields },
  handler: async (ctx, input) => {
    await requireAdmin(ctx);

    const fields = sanitizeServiceFields(input);
    if (fields.active === undefined) {
      fields.active = true;
    }
    if (fields.sortOrder === undefined) {
      const last = await ctx.db
        .query("services")
        .withIndex("by_sort_order")
        .order("desc")
        .first();
      fields.sortOrder = last ? last.sortOrder + 1 : 1;
    }

    return await ctx.db.insert("services", fields);
  },
});

export const updateService = mutationGeneric({
  args: { id: v.id("services"), ...serviceUpdateFields },
  handler: async (ctx, { id, ...input }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get("services", id);
    if (!existing) {
      throw new Error("Service not found");
    }

    const fields = sanitizeServiceFields(input);
    if (Object.keys(fields).length === 0) {
      throw new Error("No changes provided");
    }

    await ctx.db.patch("services", id, fields);
    return id;
  },
});

export const deleteService = mutationGeneric({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Service not found");
    }

    await ctx.db.delete(id);
    return { deleted: id };
  },
});

/**
 * Admin: reorder services by passing the full list of ids in the desired
 * order. sortOrder is rewritten to match the array position.
 */
export const reorderServices = mutationGeneric({
  args: { ids: v.array(v.id("services")) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx);
    assertUniqueIdList(ids, "Service");

    for (const id of ids) {
      const existing = await ctx.db.get(id);
      if (!existing) {
        throw new Error(`Service not found: ${id}`);
      }
    }

    for (let index = 0; index < ids.length; index += 1) {
      await ctx.db.patch(ids[index], { sortOrder: index + 1 });
    }

    return ids;
  },
});
