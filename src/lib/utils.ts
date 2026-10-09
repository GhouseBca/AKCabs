export { cn } from "cn";

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Formats a price as Indian Rupees. Returns "Contact for Price" when the
 * value is missing (null, undefined, NaN, or an empty string).
 */
export function formatPrice(value?: number | string | null): string {
  if (value === undefined || value === null) {
    return "Contact for Price";
  }
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return "Contact for Price";
  }
  return priceFormatter.format(amount);
}

/**
 * Parses a numeric form input. Returns `undefined` for an empty value and
 * `NaN` when the value is present but not a valid number.
 */
export function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Formats a millisecond timestamp as a readable local date and time. */
export function formatDateTime(value: number): string {
  return dateTimeFormatter.format(new Date(value));
}

/**
 * Validates a phone number: optional leading "+", 7-15 digits, and only
 * digits, spaces, parentheses, dots, or hyphens.
 */
export function isValidPhone(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || !/^[+]?[\d\s().-]+$/.test(trimmed)) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
