import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const pricingCategory = v.union(
  v.literal("local"),
  v.literal("outstation"),
  v.literal("airport"),
  v.literal("full_day"),
);

export const enquiryStatus = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const adminRole = v.union(v.literal("admin"), v.literal("staff"));

export default defineSchema({
  cars: defineTable({
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
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_available", ["available"])
    .index("by_sort_order", ["sortOrder"]),

  pricing: defineTable({
    title: v.string(),
    category: pricingCategory,
    description: v.string(),
    price: v.optional(v.number()),
    unit: v.string(),
    notes: v.string(),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["active"])
    .index("by_sort_order", ["sortOrder"]),

  services: defineTable({
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_active", ["active"])
    .index("by_sort_order", ["sortOrder"]),

  enquiries: defineTable({
    name: v.string(),
    phone: v.string(),
    pickupLocation: v.string(),
    destination: v.string(),
    travelDate: v.string(),
    passengers: v.number(),
    preferredCar: v.string(),
    message: v.string(),
    status: enquiryStatus,
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  businessSettings: defineTable({
    name: v.string(),
    tagline: v.string(),
    phone: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    address: v.string(),
    mapsUrl: v.string(),
    workingHours: v.string(),
    about: v.string(),
    heroTitle: v.string(),
    heroDescription: v.string(),
    heroImage: v.string(),
    ctaText: v.string(),
  }),

  admins: defineTable({
    name: v.string(),
    email: v.string(),
    // Legacy field from the previous custom login; unused with WorkOS.
    passwordHash: v.optional(v.string()),
    role: adminRole,
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),
});
