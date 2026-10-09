"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import { ServicesGridSkeleton } from "@/components/services/ServicesGridSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getServiceIcon } from "@/lib/service-icons";
import { cn } from "@/lib/utils";
import { getServiceEnquiryLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

export function ServicesList() {
  use(io());
  const services = useQuery(api.services.getServices);
  const settings = useQuery(api.settings.getBusinessSettings);

  if (services === undefined) {
    return <ServicesGridSkeleton />;
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="Our services are coming soon"
        description="We're updating how we help you travel. Message us and we'll plan the right ride for you."
        action={
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "gap-2")}
          >
            <MessageCircle aria-hidden="true" />
            Chat on WhatsApp
          </a>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = getServiceIcon(service.icon);
        return (
          <li
            key={service._id}
            className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold">
              {service.title}
            </h3>
            <p className="flex-1 text-sm text-muted-foreground">
              {service.description}
            </p>
            <a
              href={getServiceEnquiryLink(service.title, settings)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit",
              )}
            >
              <MessageCircle aria-hidden="true" />
              Enquire
            </a>
          </li>
        );
      })}
    </ul>
  );
}
