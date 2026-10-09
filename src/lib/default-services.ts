export type DefaultService = {
  title: string;
  description: string;
  icon: string;
};

/**
 * Fallback service list used before Convex content loads (or when the admin
 * has not published any services). Mirrors `convex/seed.ts`.
 */
export const DEFAULT_SERVICES: DefaultService[] = [
  {
    icon: "car",
    title: "Local Rides",
    description: "Quick, affordable city travel whenever you need it.",
  },
  {
    icon: "plane",
    title: "Airport Transfers",
    description: "On-time pickups and drops for every flight.",
  },
  {
    icon: "route",
    title: "Outstation Trips",
    description: "Comfortable long-distance rides across Tamil Nadu.",
  },
  {
    icon: "calendar-clock",
    title: "Full-Day Rentals",
    description: "Keep a car and driver with you for the whole day.",
  },
  {
    icon: "landmark",
    title: "Tour Packages",
    description: "Curated sightseeing trips to temples, hills, and beaches.",
  },
  {
    icon: "map",
    title: "Corporate Travel",
    description: "Reliable everyday transport for teams and businesses.",
  },
];
