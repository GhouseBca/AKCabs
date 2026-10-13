"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { CarGridSkeleton } from "@/components/cars/CarCardSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

export function CarsList() {
  use(io());
  const cars = useQuery(api.cars.getAvailableCars);
  const settings = useQuery(api.settings.getBusinessSettings);

  if (cars === undefined) {
    return <CarGridSkeleton />;
  }

  if (cars.length === 0) {
    return (
      <EmptyState
        title="No cars available right now"
        description="All of our cars are currently booked. Message us and we'll find the right vehicle for your trip."
        action={
          <a
            href={getWhatsAppLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <MessageCircle aria-hidden="true" />
            Check availability
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
