"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { DEFAULT_SERVICES, type DefaultService } from "@/lib/default-services";
import { getServiceIcon } from "@/lib/service-icons";
import { api } from "../../../convex/_generated/api";

export function HeroHighlights() {
  use(io());
  const services = useQuery(api.services.getServices);
  const highlights: DefaultService[] =
    services && services.length > 0 ? services.slice(0, 6) : DEFAULT_SERVICES;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {highlights.map((service) => {
        const Icon = getServiceIcon(service.icon);
        return (
          <li
            key={service.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-semibold">
                {service.title}
              </span>
              <span className="block text-sm text-muted-foreground">
                {service.description}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
