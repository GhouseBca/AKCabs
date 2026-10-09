import {
  CarFront,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview of your business at a glance.",
  },
  {
    label: "Cars",
    href: "/admin/cars",
    icon: CarFront,
    description: "Manage your fleet and car availability.",
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    icon: Tags,
    description: "Manage fare cards and pricing plans.",
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: Inbox,
    description: "Review and follow up on customer enquiries.",
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: Sparkles,
    description: "Manage the services shown on your site.",
  },
  {
    label: "Business Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Update contact details and site content.",
  },
];

export function getAdminNavItem(pathname: string): AdminNavItem {
  return (
    ADMIN_NAV.find((item) => {
      if (item.href === "/admin") {
        return pathname === "/admin";
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }) ?? ADMIN_NAV[0]
  );
}
