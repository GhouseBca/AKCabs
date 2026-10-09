import { internalMutationGeneric } from "convex/server";

const SERVICES = [
  {
    title: "Airport Pickup & Drop",
    description:
      "On-time airport transfers with flight tracking, meet-and-greet, and luggage assistance.",
    icon: "plane",
    sortOrder: 1,
  },
  {
    title: "Local City Rides",
    description:
      "Quick and comfortable rides within the city for daily commutes, errands, and appointments.",
    icon: "car",
    sortOrder: 2,
  },
  {
    title: "Outstation Trips",
    description:
      "Travel to nearby cities and towns with experienced drivers and well-maintained vehicles.",
    icon: "route",
    sortOrder: 3,
  },
  {
    title: "Full Day Rental",
    description:
      "Book a car with driver for a full day — ideal for meetings, shopping, and sightseeing.",
    icon: "calendar-clock",
    sortOrder: 4,
  },
  {
    title: "Temple & Pilgrimage Trips",
    description:
      "Comfortable rides to temples and pilgrimage destinations, planned around your schedule.",
    icon: "landmark",
    sortOrder: 5,
  },
  {
    title: "Tour Packages",
    description:
      "Curated multi-day tour packages covering popular destinations at great value.",
    icon: "map",
    sortOrder: 6,
  },
];

export const seed = internalMutationGeneric(async (ctx) => {
  const settings = await ctx.db.query("businessSettings").first();
  if (!settings) {
    await ctx.db.insert("businessSettings", {
      name: "AK Cabs",
      tagline: "Your trusted travel partner",
      phone: "9487556868",
      whatsapp: "8610849962",
      email: "",
      address: "",
      mapsUrl: "",
      workingHours: "",
      about: "",
      heroTitle: "",
      heroDescription: "",
      heroImage: "",
      ctaText: "",
    });
  }

  const existing = await ctx.db.query("services").collect();
  const existingTitles = new Set(existing.map((service) => service.title));

  for (const service of SERVICES) {
    if (!existingTitles.has(service.title)) {
      await ctx.db.insert("services", { ...service, active: true });
    }
  }
});
