export type PricingCategory = "local" | "outstation" | "airport" | "full_day";

import type { Doc } from "../../../../convex/_generated/dataModel";

export type PricingRecord = Doc<"pricing">;

export const PRICING_CATEGORIES: Array<{
  value: PricingCategory;
  label: string;
}> = [
  { value: "local", label: "Local" },
  { value: "outstation", label: "Outstation" },
  { value: "airport", label: "Airport" },
  { value: "full_day", label: "Full day" },
];

export const CATEGORY_LABELS: Record<PricingCategory, string> = {
  local: "Local",
  outstation: "Outstation",
  airport: "Airport",
  full_day: "Full day",
};

export type PricingFormValues = {
  title: string;
  category: PricingCategory;
  description: string;
  price: string;
  unit: string;
  notes: string;
  active: boolean;
};

export const EMPTY_PRICING_FORM: PricingFormValues = {
  title: "",
  category: "local",
  description: "",
  price: "",
  unit: "",
  notes: "",
  active: true,
};

export function pricingToForm(record: PricingRecord): PricingFormValues {
  return {
    title: record.title,
    category: record.category,
    description: record.description,
    price: record.price === undefined ? "" : String(record.price),
    unit: record.unit,
    notes: record.notes,
    active: record.active,
  };
}

export function validatePricing(
  values: PricingFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const title = values.title.trim();
  if (title.length === 0) {
    errors.title = "Title is required.";
  } else if (title.length > 120) {
    errors.title = "Title must be 120 characters or fewer.";
  }

  if (!PRICING_CATEGORIES.some((item) => item.value === values.category)) {
    errors.category = "Choose a category.";
  }

  if (values.description.trim().length > 2000) {
    errors.description = "Description must be 2000 characters or fewer.";
  }

  const price = Number(values.price);
  if (
    values.price.trim().length > 0 &&
    (Number.isNaN(price) || price < 0)
  ) {
    errors.price = "Price must be a positive amount.";
  }

  const unit = values.unit.trim();
  if (unit.length === 0) {
    errors.unit = "Unit is required.";
  } else if (unit.length > 60) {
    errors.unit = "Unit must be 60 characters or fewer.";
  }

  if (values.notes.trim().length > 1000) {
    errors.notes = "Notes must be 1000 characters or fewer.";
  }

  return errors;
}
