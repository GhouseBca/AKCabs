import { isValidPhone } from "@/lib/utils";

export type BusinessSettings = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  workingHours: string;
  about: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  ctaText: string;
};

export type SettingsValues = BusinessSettings;

export const EMPTY_SETTINGS: SettingsValues = {
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

export function settingsToForm(
  settings: BusinessSettings | null,
): SettingsValues {
  if (!settings) {
    return EMPTY_SETTINGS;
  }
  return {
    name: settings.name ?? "",
    tagline: settings.tagline ?? "",
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    mapsUrl: settings.mapsUrl ?? "",
    workingHours: settings.workingHours ?? "",
    about: settings.about ?? "",
    heroTitle: settings.heroTitle ?? "",
    heroDescription: settings.heroDescription ?? "",
    heroImage: settings.heroImage ?? "",
    ctaText: settings.ctaText ?? "",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSettings(
  values: SettingsValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = values.name.trim();
  if (name.length === 0) {
    errors.name = "Business name is required.";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (values.tagline.trim().length > 200) {
    errors.tagline = "Tagline must be 200 characters or fewer.";
  }

  if (values.phone.trim().length > 0 && !isValidPhone(values.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (values.whatsapp.trim().length > 0 && !isValidPhone(values.whatsapp)) {
    errors.whatsapp = "Enter a valid WhatsApp number.";
  }

  const email = values.email.trim();
  if (email.length > 0 && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.address.trim().length > 300) {
    errors.address = "Address must be 300 characters or fewer.";
  }

  const mapsUrl = values.mapsUrl.trim();
  if (mapsUrl.length > 0 && !isHttpUrl(mapsUrl)) {
    errors.mapsUrl = "Enter a valid URL starting with http:// or https://.";
  }

  if (values.workingHours.trim().length > 200) {
    errors.workingHours = "Working hours must be 200 characters or fewer.";
  }

  if (values.about.trim().length > 5000) {
    errors.about = "About must be 5000 characters or fewer.";
  }

  if (values.heroTitle.trim().length > 200) {
    errors.heroTitle = "Hero title must be 200 characters or fewer.";
  }

  if (values.heroDescription.trim().length > 1000) {
    errors.heroDescription = "Hero description must be 1000 characters or fewer.";
  }

  if (values.ctaText.trim().length > 60) {
    errors.ctaText = "CTA text must be 60 characters or fewer.";
  }

  return errors;
}
