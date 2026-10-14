"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { CarGridSkeleton } from "@/components/cars/CarCardSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

export function CarsList() {
  use(io());
  const { t } = useLanguage();
  const cars = useQuery(api.cars.getAvailableCars);
  const settings = useQuery(api.settings.getBusinessSettings);

  if (cars === undefined) {
    return <CarGridSkeleton />;
  }

  if (cars.length === 0) {
    return (
      <EmptyState
        title={t("cars.emptyTitle")}
        description={t("cars.emptyDescription")}
        action={
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <MessageCircle aria-hidden="true" />
            {t("cars.checkAvailability")}
          </a>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car._id} car={car} settings={settings} />
      ))}
    </div>
  );
}
