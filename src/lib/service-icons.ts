import {
  CalendarClock,
  Car,
  Landmark,
  Map,
  Plane,
  Route,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the icon keys stored on `services` documents to Lucide components.
 * Keep in sync with the icons used by `convex/seed.ts`.
 */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  plane: Plane,
  car: Car,
  route: Route,
  "calendar-clock": CalendarClock,
  landmark: Landmark,
  map: Map,
};

/** Resolves an icon key to a component, falling back to a generic car icon. */
export function getServiceIcon(icon?: string | null): LucideIcon {
  return (icon && SERVICE_ICONS[icon]) || Car;
}
