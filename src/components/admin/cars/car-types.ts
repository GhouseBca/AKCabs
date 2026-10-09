import type { Doc } from "../../../../convex/_generated/dataModel";

export type CarRecord = Doc<"cars">;

export const FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "CNG",
  "Electric",
  "Hybrid",
] as const;

export const TRANSMISSIONS = ["Manual", "Automatic"] as const;

export const MAX_ADDITIONAL_IMAGES = 6;
export const MAX_FEATURES = 30;

export type CarFormValues = {
  name: string;
  model: string;
  year: string;
  image: string;
  additionalImages: string[];
  seatingCapacity: string;
  acAvailable: boolean;
  fuelType: string;
  transmission: string;
  description: string;
  features: string[];
  localRate: string;
  outstationRate: string;
  airportRate: string;
  fullDayRate: string;
  perKmRate: string;
  driverIncluded: boolean;
  available: boolean;
};

export const EMPTY_CAR_FORM: CarFormValues = {
  name: "",
  model: "",
  year: "",
  image: "",
  additionalImages: [],
  seatingCapacity: "4",
  acAvailable: true,
  fuelType: "Petrol",
  transmission: "Manual",
  description: "",
  features: [],
  localRate: "",
  outstationRate: "",
  airportRate: "",
  fullDayRate: "",
  perKmRate: "",
  driverIncluded: true,
  available: true,
};

export function carToForm(car: CarRecord): CarFormValues {
  return {
    name: car.name,
    model: car.model,
    year: car.year === undefined ? "" : String(car.year),
    image: car.image,
    additionalImages: car.additionalImages ?? [],
    seatingCapacity: String(car.seatingCapacity),
    acAvailable: car.acAvailable,
    fuelType: car.fuelType,
    transmission: car.transmission,
    description: car.description,
    features: car.features,
    localRate: car.localRate == null ? "" : String(car.localRate),
    outstationRate:
      car.outstationRate === undefined ? "" : String(car.outstationRate),
    airportRate: car.airportRate === undefined ? "" : String(car.airportRate),
    fullDayRate: car.fullDayRate === undefined ? "" : String(car.fullDayRate),
    perKmRate: car.perKmRate === undefined ? "" : String(car.perKmRate),
    driverIncluded: car.driverIncluded,
    available: car.available,
  };
}

export function validateCar(values: CarFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const currentYear = new Date().getFullYear();

  if (!values.name.trim()) {
    errors.name = "Car name is required.";
  } else if (values.name.trim().length > 120) {
    errors.name = "Keep the name under 120 characters.";
  }

  if (!values.model.trim()) {
    errors.model = "Model is required.";
  } else if (values.model.trim().length > 120) {
    errors.model = "Keep the model under 120 characters.";
  }

  if (values.year.trim().length > 0) {
    const year = Number(values.year);
    if (!Number.isInteger(year) || year < 1950 || year > currentYear + 1) {
      errors.year = `Enter a year between 1950 and ${currentYear + 1}.`;
    }
  }

  const seats = Number(values.seatingCapacity.trim());
  if (values.seatingCapacity.trim().length === 0) {
    errors.seatingCapacity = "Seating capacity is required.";
  } else if (!Number.isInteger(seats) || seats < 1 || seats > 60) {
    errors.seatingCapacity = "Enter a whole number between 1 and 60.";
  }

  if (!values.fuelType.trim()) {
    errors.fuelType = "Select a fuel type.";
  }

  if (!values.transmission.trim()) {
    errors.transmission = "Select a transmission.";
  }

  if (!values.image) {
    errors.image = "Add a main image for this car.";
  }

  if (values.additionalImages.length > MAX_ADDITIONAL_IMAGES) {
    errors.additionalImages = `Up to ${MAX_ADDITIONAL_IMAGES} additional images.`;
  }

  if (values.description.trim().length > 2000) {
    errors.description = "Keep the description under 2000 characters.";
  }

  if (values.features.length > MAX_FEATURES) {
    errors.features = `Up to ${MAX_FEATURES} features.`;
  } else if (values.features.some((feature) => feature.trim().length > 120)) {
    errors.features = "Each feature must be 120 characters or fewer.";
  }

  const rateFields: Array<[keyof CarFormValues, string]> = [
    ["localRate", "Local rate"],
    ["outstationRate", "Outstation rate"],
    ["airportRate", "Airport rate"],
    ["fullDayRate", "Full day rate"],
    ["perKmRate", "Per km rate"],
  ];

  for (const [key, label] of rateFields) {
    const raw = values[key] as string;
    const parsed = Number(raw);
    if (raw.trim().length > 0 && (Number.isNaN(parsed) || parsed < 0)) {
      errors[key] = `${label} must be a positive amount.`;
    }
  }

  return errors;
}
