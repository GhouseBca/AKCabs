"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import { ServicesGridSkeleton } from "@/components/services/ServicesGridSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getServiceIcon } from "@/lib/service-icons";
import { cn } from "@/lib/utils";
import { getServiceEnquiryLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

export function ServicesList() {
  use(io());
  const { t } = useLanguage();
  const services = useQuery(api.services.getServices);
  const settings = useQuery(api.settings.getBusinessSettings);

  if (services === undefined) {
    return <ServicesGridSkeleton />;
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title={t("services.emptyTitle")}
        description={t("services.emptyDescription")}
        action={
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "gap-2")}
          >
            <MessageCircle aria-hidden="true" />
            {t("services.chatWhatsApp")}
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
            className="card-lift reveal flex flex-col gap-3 p-5"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-brand/10">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold">
              {service.title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
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
              {t("services.enquire")}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
