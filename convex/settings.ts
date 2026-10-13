import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

const PUBLIC_FIELDS = [
  "name",
  "tagline",
  "phone",
  "whatsapp",
  "email",
  "address",
  "mapsUrl",
  "workingHours",
  "about",
  "heroTitle",
  "heroDescription",
  "heroImage",
  "ctaText",
] as const;

type PublicSettings = { [K in (typeof PUBLIC_FIELDS)[number]]: string };

const SETTINGS_DEFAULTS: PublicSettings = {
  name: "",
  tagline: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  mapsUrl: "",
  workingHours: "",
  about: "",
  heroTitle: "",
  heroDescription: "",
  heroImage: "",
  ctaText: "",
};

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

function cleanEmail(value: string, field: string, required = false): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    if (required) {
      throw new Error(`${field} is required`);
    }
    return "";
  }
  if (trimmed.length > 200) {
    throw new Error(`${field} must be at most 200 characters`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error(`${field} must be a valid email address`);
  }
  return trimmed;
}

function cleanUrl(value: string, field: string, required = false): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    if (required) {
      throw new Error(`${field} is required`);
    }
    return "";
  }
  if (trimmed.length > 2048) {
    throw new Error(`${field} must be at most 2048 characters`);
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error(`${field} must be a valid URL`);
  }
  return trimmed;
}

function cleanMediaRef(
  value: string,
  field: string,
  required = false,
): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    if (required) {
      throw new Error(`${field} is required`);
    }
    return "";
  }
  if (trimmed.length > 2048) {
    throw new Error(`${field} must be at most 2048 characters`);
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed);
    } catch {
      throw new Error(`${field} must be a valid URL or storage id`);
    }
  }
  return trimmed;
}

type SettingsInput = Partial<PublicSettings>;

function sanitizeSettingsFields(
  input: SettingsInput,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  if (input.name !== undefined) {
    fields.name = cleanText(input.name, "Name", 120);
  }
  if (input.tagline !== undefined) {
    fields.tagline = cleanText(input.tagline, "Tagline", 200, false);
  }
  if (input.phone !== undefined) {
    fields.phone = cleanPhone(input.phone, "Phone", false);
  }
  if (input.whatsapp !== undefined) {
    fields.whatsapp = cleanPhone(input.whatsapp, "WhatsApp", false);
  }
  if (input.email !== undefined) {
    fields.email = cleanEmail(input.email, "Email", false);
  }
  if (input.address !== undefined) {
    fields.address = cleanText(input.address, "Address", 300, false);
  }
  if (input.mapsUrl !== undefined) {
    fields.mapsUrl = cleanUrl(input.mapsUrl, "Maps URL", false);
  }
  if (input.workingHours !== undefined) {
    fields.workingHours = cleanText(input.workingHours, "Working hours", 200, false);
  }
  if (input.about !== undefined) {
    fields.about = cleanText(input.about, "About", 5000, false);
  }
  if (input.heroTitle !== undefined) {
    fields.heroTitle = cleanText(input.heroTitle, "Hero title", 200, false);
  }
  if (input.heroDescription !== undefined) {
    fields.heroDescription = cleanText(
      input.heroDescription,
      "Hero description",
      1000,
      false,
    );
  }
  if (input.heroImage !== undefined) {
    fields.heroImage = cleanMediaRef(input.heroImage, "Hero image", false);
  }
  if (input.ctaText !== undefined) {
    fields.ctaText = cleanText(input.ctaText, "CTA text", 60, false);
  }

  return fields;
}

const settingsUpdateFields = {
  name: v.optional(v.string()),
  tagline: v.optional(v.string()),
  phone: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  email: v.optional(v.string()),
  address: v.optional(v.string()),
  mapsUrl: v.optional(v.string()),
  workingHours: v.optional(v.string()),
  about: v.optional(v.string()),
  heroTitle: v.optional(v.string()),
  heroDescription: v.optional(v.string()),
  heroImage: v.optional(v.string()),
  ctaText: v.optional(v.string()),
};

/**
 * Public: business settings, limited to customer-facing fields.
 */
export const getBusinessSettings = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("businessSettings").first();
    if (!settings) {
      return null;
    }
    const result = {} as PublicSettings;
    for (const field of PUBLIC_FIELDS) {
      result[field] = settings[field];
    }
    return result;
  },
});

export const updateBusinessSettings = mutationGeneric({
  args: { ...settingsUpdateFields },
  handler: async (ctx, input) => {
    await requireAdmin(ctx);

    const fields = sanitizeSettingsFields(input);
    if (Object.keys(fields).length === 0) {
      throw new Error("No changes provided");
    }

    const existing = await ctx.db.query("businessSettings").first();
    if (!existing) {
      await ctx.db.insert("businessSettings", {
        ...SETTINGS_DEFAULTS,
        ...fields,
      });
    } else {
      await ctx.db.patch(existing._id, fields);
    }

    return await ctx.db.query("businessSettings").first();
  },
});
