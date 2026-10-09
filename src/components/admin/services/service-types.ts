import type { Doc } from "../../../../convex/_generated/dataModel";

export type ServiceRecord = Doc<"services">;

export const MAX_SERVICE_TITLE = 120;
export const MAX_SERVICE_DESCRIPTION = 2000;

export type ServiceFormValues = {
  title: string;
  description: string;
  icon: string;
  active: boolean;
};

export const EMPTY_SERVICE_FORM: ServiceFormValues = {
  title: "",
  description: "",
  icon: "car",
  active: true,
};

export function serviceToForm(service: ServiceRecord): ServiceFormValues {
  return {
    title: service.title,
    description: service.description,
    icon: service.icon || "car",
    active: service.active,
  };
}

export function validateService(
  values: ServiceFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const title = values.title.trim();
  if (title.length === 0) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_SERVICE_TITLE) {
    errors.title = `Title must be ${MAX_SERVICE_TITLE} characters or fewer.`;
  }

  if (values.description.trim().length > MAX_SERVICE_DESCRIPTION) {
    errors.description = `Description must be ${MAX_SERVICE_DESCRIPTION} characters or fewer.`;
  }

  if (values.icon.trim().length > 60) {
    errors.icon = "Icon key must be 60 characters or fewer.";
  }

  return errors;
}
