"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { PricingGridSkeleton } from "@/components/pricing/PricingGridSkeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatPrice } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

const CATEGORY_LABELS: Record<string, string> = {
  local: "Local",
  outstation: "Outstation",
  airport: "Airport",
  full_day: "Full Day",
};

export function PricingList() {
  use(io());
  const pricing = useQuery(api.pricing.getActivePricing, {});
  const settings = useQuery(api.settings.getBusinessSettings);

  if (pricing === undefined) {
    return <PricingGridSkeleton />;
  }

  if (pricing.length === 0) {
    return (
      <EmptyState
        title="Pricing is being updated"
        description="Our fares are being revised. Message us on WhatsApp and we'll send you a personalised quote — usually within minutes."
        action={
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Get a quote on WhatsApp
          </a>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pricing.map((entry) => (
        <div
          key={entry._id}
          className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold">
              {entry.title}
            </h3>
            <Badge variant="secondary">{CATEGORY_LABELS[entry.category]}</Badge>
          </div>
          <p className="font-heading text-2xl font-bold">
            {formatPrice(entry.price)}
            {entry.price !== undefined && entry.unit ? (
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                / {entry.unit}
              </span>
            ) : null}
          </p>
          {entry.description ? (
            <p className="text-sm text-muted-foreground">
              {entry.description}
            </p>
          ) : null}
          {entry.notes ? (
            <p className="text-xs text-muted-foreground">{entry.notes}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
