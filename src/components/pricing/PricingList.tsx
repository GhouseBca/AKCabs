"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { PricingGridSkeleton } from "@/components/pricing/PricingGridSkeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn, formatPrice } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  local: "pricing.category.local",
  outstation: "pricing.category.outstation",
  airport: "pricing.category.airport",
  full_day: "pricing.category.fullDay",
};

export function PricingList() {
  use(io());
  const { t } = useLanguage();
  const pricing = useQuery(api.pricing.getActivePricing, {});
  const settings = useQuery(api.settings.getBusinessSettings);

  if (pricing === undefined) {
    return <PricingGridSkeleton />;
  }

  if (pricing.length === 0) {
    return (
      <EmptyState
        title={t("pricing.emptyTitle")}
        description={t("pricing.emptyDescription")}
        action={
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {t("pricing.getQuote")}
          </a>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pricing.map((entry) => {
        const categoryKey = CATEGORY_KEYS[entry.category];
        const hasPrice = entry.price !== undefined && entry.price !== null;
        return (
          <div
            key={entry._id}
            className="card-lift reveal flex flex-col gap-3 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold">
                {entry.title}
              </h3>
              <Badge variant="secondary">
                {categoryKey ? t(categoryKey) : entry.category}
              </Badge>
            </div>
            <p
              className={cn(
                "font-heading text-2xl font-bold",
                hasPrice && "text-primary",
              )}
            >
              {hasPrice ? formatPrice(entry.price) : t("common.contactForPrice")}
              {hasPrice && entry.unit ? (
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  / {entry.unit}
                </span>
              ) : null}
            </p>
            {entry.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {entry.description}
              </p>
            ) : null}
            {entry.notes ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {entry.notes}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
