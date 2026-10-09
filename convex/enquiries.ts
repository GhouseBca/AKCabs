import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";
import { enquiryStatus } from "./schema";

const MAX_ENQUIRIES_PER_PAGE = 200;

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

function cleanPhone(value: string, field: string, required = true): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    if (required) {
      throw new Error(`${field} is required`);
    }
    return "";
  }
  if (trimmed.length > 30) {
    throw new Error(`${field} must be at most 30 characters`);
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!/^[+]?[\d\s().-]+$/.test(trimmed) || digits.length < 7 || digits.length > 15) {
    throw new Error(`${field} must be a valid phone number`);
  }
  return trimmed;
}

function cleanTravelDate(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("Travel date is required");
  }
  if (trimmed.length > 40) {
    throw new Error("Travel date must be at most 40 characters");
  }
  if (Number.isNaN(Date.parse(trimmed))) {
    throw new Error("Travel date must be a valid date");
  }
  return trimmed;
}

function cleanPassengers(value: number): number {
  if (!Number.isInteger(value)) {
    throw new Error("Passengers must be a whole number");
  }
  if (value < 1 || value > 50) {
    throw new Error("Passengers must be between 1 and 50");
  }
  return value;
}

function cleanLimit(value: number | undefined): number {
  if (value === undefined) {
    return 100;
  }
  if (!Number.isInteger(value) || value < 1 || value > MAX_ENQUIRIES_PER_PAGE) {
    throw new Error(`Limit must be between 1 and ${MAX_ENQUIRIES_PER_PAGE}`);
  }
  return value;
}

/**
 * Public: submit a new enquiry from the website contact form.
 */
export const createEnquiry = mutationGeneric({
  args: {
    name: v.string(),
    phone: v.string(),
    pickupLocation: v.string(),
    destination: v.string(),
    travelDate: v.string(),
    passengers: v.number(),
    preferredCar: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, input) => {
    const now = Date.now();
    return await ctx.db.insert("enquiries", {
      name: cleanText(input.name, "Name", 120),
      phone: cleanPhone(input.phone, "Phone"),
      pickupLocation: cleanText(input.pickupLocation, "Pickup location", 200),
      destination: cleanText(input.destination, "Destination", 200),
      travelDate: cleanTravelDate(input.travelDate),
      passengers: cleanPassengers(input.passengers),
      preferredCar:
        input.preferredCar === undefined
          ? ""
          : cleanText(input.preferredCar, "Preferred car", 120, false),
      message:
        input.message === undefined
          ? ""
          : cleanText(input.message, "Message", 2000, false),
      status: "new",
      createdAt: now,
    });
  },
});

/**
 * Admin: list enquiries, newest first, optionally filtered by status.
 */
export const getEnquiries = queryGeneric({
  args: {
    token: v.string(),
    status: v.optional(enquiryStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { token, status, limit }) => {
    await requireAdmin(ctx, token);
    const take = cleanLimit(limit);

    if (status) {
      const rows = await ctx.db
        .query("enquiries")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      return rows.sort((a, b) => b.createdAt - a.createdAt).slice(0, take);
    }

    return await ctx.db
      .query("enquiries")
      .withIndex("by_created_at")
      .order("desc")
      .take(take);
  },
});

export const updateEnquiryStatus = mutationGeneric({
  args: {
    token: v.string(),
    id: v.id("enquiries"),
    status: enquiryStatus,
  },
  handler: async (ctx, { token, id, status }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("enquiries", id);
    if (!existing) {
      throw new Error("Enquiry not found");
    }

    await ctx.db.patch("enquiries", id, { status });
    return { id, status };
  },
});

export const deleteEnquiry = mutationGeneric({
  args: { token: v.string(), id: v.id("enquiries") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);

    const existing = await ctx.db.get("enquiries", id);
    if (!existing) {
      throw new Error("Enquiry not found");
    }

    await ctx.db.delete("enquiries", id);
    return { deleted: id };
  },
});

/**
 * Admin: aggregate counts for the dashboard.
 */
export const getDashboardStats = queryGeneric({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);

    const [enquiries, cars, pricing, services] = await Promise.all([
      ctx.db.query("enquiries").collect(),
      ctx.db.query("cars").collect(),
      ctx.db.query("pricing").collect(),
      ctx.db.query("services").collect(),
    ]);

    const byStatus = { new: 0, contacted: 0, completed: 0, cancelled: 0 };
    for (const enquiry of enquiries) {
      byStatus[enquiry.status as keyof typeof byStatus] += 1;
    }

    return {
      enquiries: {
        total: enquiries.length,
        new: byStatus.new,
        contacted: byStatus.contacted,
        completed: byStatus.completed,
        cancelled: byStatus.cancelled,
      },
      cars: {
        total: cars.length,
        available: cars.filter((car) => car.available).length,
      },
      pricing: {
        total: pricing.length,
        active: pricing.filter((row) => row.active).length,
      },
      services: {
        total: services.length,
        active: services.filter((service) => service.active).length,
      },
    };
  },
});
