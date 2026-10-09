import { queryGeneric, mutationGeneric } from "convex/server";
import { v, type GenericId } from "convex/values";
import { requireAdmin } from "./auth";

const MAX_MEDIA_REF_LENGTH = 2048;
const MAX_ADDITIONAL_IMAGES = 20;
const MAX_FEATURES = 50;
const MAX_IMAGE_URLS_PER_LOOKUP = 200;

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

function cleanMediaRef(value: string, field: string): string {
  const trimmed = cleanText(value, field, MAX_MEDIA_REF_LENGTH);
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed);
    } catch {
      throw new Error(`${field} must be a valid URL or storage id`);
    }
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

function cleanPositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be a whole number`);
  }
  if (value <= 0) {
    throw new Error(`${field} must be greater than 0`);
  }
  return value;
}

function cleanYear(value: number): number {
  if (!Number.isInteger(value)) {
    throw new Error("Year must be a whole number");
  }
  const currentYear = new Date().getFullYear();
  if (value < 1950 || value > currentYear + 1) {
    throw new Error(`Year must be between 1950 and ${currentYear + 1}`);
  }
  return value;
}

function cleanStringArray(
  value: string[],
  field: string,
  maxItems: number,
  maxItemLength: number,
): string[] {
  if (value.length > maxItems) {
    throw new Error(`${field} must have at most ${maxItems} items`);
  }
  return value.map((item, index) =>
    cleanText(item, `${field}[${index}]`, maxItemLength),
  );
}

function cleanMediaArray(
  value: string[],
  field: string,
  maxItems: number,
): string[] {
  if (value.length > maxItems) {
    throw new Error(`${field} must have at most ${maxItems} items`);
  }
  return value.map((item, index) => cleanMediaRef(item, `${field}[${index}]`));
}

function assertUniqueIdList(ids: string[], label: string): void {
  if (ids.length === 0) {
    throw new Error(`${label} list cannot be empty`);
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} list contains duplicate ids`);
  }
}

type CarInput = {
  name?: string;
  model?: string;
  year?: number;
  image?: string;
  additionalImages?: string[];
  seatingCapacity?: number;
  acAvailable?: boolean;
  fuelType?: string;
  transmission?: string;
  description?: string;
  features?: string[];
  localRate?: number;
  outstationRate?: number;
  airportRate?: number;
  fullDayRate?: number;
  perKmRate?: number;
  driverIncluded?: boolean;
  available?: boolean;
  sortOrder?: number;
};

function sanitizeCarFields(input: CarInput): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  if (input.name !== undefined) {
    fields.name = cleanText(input.name, "Name", 120);
  }
  if (input.model !== undefined) {
    fields.model = cleanText(input.model, "Model", 120);
  }
  if (input.year !== undefined) {
    fields.year = cleanYear(input.year);
  }
  if (input.image !== undefined) {
    fields.image = cleanMediaRef(input.image, "Image");
  }
  if (input.additionalImages !== undefined) {
    fields.additionalImages = cleanMediaArray(
      input.additionalImages,
      "Additional images",
      MAX_ADDITIONAL_IMAGES,
    );
  }
  if (input.seatingCapacity !== undefined) {
    fields.seatingCapacity = cleanPositiveInteger(
      input.seatingCapacity,
      "Seating capacity",
    );
  }
  if (input.acAvailable !== undefined) {
    fields.acAvailable = input.acAvailable;
  }
  if (input.fuelType !== undefined) {
    fields.fuelType = cleanText(input.fuelType, "Fuel type", 60);
  }
  if (input.transmission !== undefined) {
    fields.transmission = cleanText(input.transmission, "Transmission", 60);
  }
  if (input.description !== undefined) {
    fields.description = cleanText(input.description, "Description", 2000, false);
  }
  if (input.features !== undefined) {
    fields.features = cleanStringArray(input.features, "Features", MAX_FEATURES, 120);
  }
  if (input.localRate !== undefined) {
    fields.localRate = cleanNonNegativeNumber(input.localRate, "Local rate");
  }
  if (input.outstationRate !== undefined) {
    fields.outstationRate = cleanNonNegativeNumber(
      input.outstationRate,
      "Outstation rate",
    );
  }
  if (input.airportRate !== undefined) {
    fields.airportRate = cleanNonNegativeNumber(input.airportRate, "Airport rate");
  }
  if (input.fullDayRate !== undefined) {
    fields.fullDayRate = cleanNonNegativeNumber(input.fullDayRate, "Full day rate");
  }
  if (input.perKmRate !== undefined) {
    fields.perKmRate = cleanNonNegativeNumber(input.perKmRate, "Per km rate");
  }
  if (input.driverIncluded !== undefined) {
    fields.driverIncluded = input.driverIncluded;
  }
  if (input.available !== undefined) {
    fields.available = input.available;
  }
  if (input.sortOrder !== undefined) {
    fields.sortOrder = cleanNonNegativeInteger(input.sortOrder, "Sort order");
  }

  return fields;
}

const carFields = {
  name: v.string(),
  model: v.string(),
  year: v.optional(v.number()),
  image: v.string(),
  additionalImages: v.optional(v.array(v.string())),
  seatingCapacity: v.number(),
  acAvailable: v.boolean(),
  fuelType: v.string(),
  transmission: v.string(),
  description: v.string(),
  features: v.array(v.string()),
  localRate: v.optional(v.number()),
  outstationRate: v.optional(v.number()),
  airportRate: v.optional(v.number()),
  fullDayRate: v.optional(v.number()),
  perKmRate: v.optional(v.number()),
  driverIncluded: v.boolean(),
  available: v.boolean(),
  sortOrder: v.optional(v.number()),
};

const carUpdateFields = {
  name: v.optional(v.string()),
  model: v.optional(v.string()),
  year: v.optional(v.number()),
  image: v.optional(v.string()),
  additionalImages: v.optional(v.array(v.string())),
  seatingCapacity: v.optional(v.number()),
  acAvailable: v.optional(v.boolean()),
  fuelType: v.optional(v.string()),
  transmission: v.optional(v.string()),
  description: v.optional(v.string()),
  features: v.optional(v.array(v.string())),
  localRate: v.optional(v.number()),
  outstationRate: v.optional(v.number()),
  airportRate: v.optional(v.number()),
  fullDayRate: v.optional(v.number()),
  perKmRate: v.optional(v.number()),
  driverIncluded: v.optional(v.boolean()),
  available: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
};

/**
 * Public: all cars that are currently available, ordered for display.
 */
export const getAvailableCars = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const cars = await ctx.db
      .query("cars")
      .withIndex("by_available", (q) => q.eq("available", true))
      .collect();
    return cars.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Public: a single car by id. Returns null when the car does not exist.
 */
export const getCarById = queryGeneric({
  args: { id: v.id("cars") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get("cars", id);
  },
});

/**
 * Admin: every car including unavailable ones, ordered for display.
 */
export const getCars = queryGeneric({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("cars")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});

/**
 * Admin: returns a short-lived URL that an authenticated client can POST a
 * file to. The POST response contains the storage id to save on a car.
 */
export const generateUploadUrl = mutationGeneric({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Public: resolve Convex storage ids (from car images) to temporary URLs.
 * Unknown or expired ids resolve to null.
 */
export const getImageUrls = queryGeneric({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, { storageIds }) => {
    const uniqueIds = Array.from(new Set(storageIds)).slice(
      0,
      MAX_IMAGE_URLS_PER_LOOKUP,
    );
    const entries = await Promise.all(
      uniqueIds.map(async (storageId) => {
        if (storageId.trim().length === 0) {
          return [storageId, null] as const;
        }
        const url = await ctx.storage.getUrl(
          storageId as GenericId<"_storage">,
        );
        return [storageId, url] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<string, string | null>;
  },
});

export const createCar = mutationGeneric({
  args: { token: v.string(), ...carFields },
  handler: async (ctx, { token, ...input }) => {
    await requireAdmin(ctx, token);

    const fields = sanitizeCarFields(input);
    const now = Date.now();

    if (fields.sortOrder === undefined) {
      const last = await ctx.db
        .query("cars")
        .withIndex("by_sort_order")
        .order("desc")
        .first();
      fields.sortOrder = last ? last.sortOrder + 1 : 1;
    }

    return await ctx.db.insert("cars", {
      ...fields,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCar = mutationGeneric({
  args: { token: v.string(), id: v.id("cars"), ...carUpdateFields },
  handler: async (ctx, { token, id, ...input }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("cars", id);
    if (!existing) {
      throw new Error("Car not found");
    }

    const fields = sanitizeCarFields(input);
    if (Object.keys(fields).length === 0) {
      throw new Error("No changes provided");
    }

    await ctx.db.patch("cars", id, { ...fields, updatedAt: Date.now() });
    return id;
  },
});

export const deleteCar = mutationGeneric({
  args: { token: v.string(), id: v.id("cars") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("cars", id);
    if (!existing) {
      throw new Error("Car not found");
    }

    await ctx.db.delete("cars", id);
    return { deleted: id };
  },
});

export const toggleCarAvailability = mutationGeneric({
  args: {
    token: v.string(),
    id: v.id("cars"),
    available: v.optional(v.boolean()),
  },
  handler: async (ctx, { token, id, available }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("cars", id);
    if (!existing) {
      throw new Error("Car not found");
    }

    const next = available ?? !existing.available;
    await ctx.db.patch("cars", id, { available: next, updatedAt: Date.now() });
    return { available: next };
  },
});

/**
 * Admin: reorder cars by passing the full list of car ids in the desired
 * order. sortOrder is rewritten to match the array position.
 */
export const reorderCars = mutationGeneric({
  args: { token: v.string(), ids: v.array(v.id("cars")) },
  handler: async (ctx, { token, ids }) => {
    await requireAdmin(ctx, token);
    assertUniqueIdList(ids, "Car");

    const now = Date.now();
    for (let index = 0; index < ids.length; index++) {
      const car = await ctx.db.get("cars", ids[index]);
      if (!car) {
        throw new Error(`Car not found: ${ids[index]}`);
      }
    }
    for (let index = 0; index < ids.length; index++) {
      await ctx.db.patch("cars", ids[index], {
        sortOrder: index + 1,
        updatedAt: now,
      });
    }

    return { updated: ids.length };
  },
});
