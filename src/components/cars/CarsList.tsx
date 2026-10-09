"use client";

import { use, useMemo } from "react";
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

const HTTP_URL = /^https?:\/\//i;

type ImageLookup = Record<string, string | null>;

function isStorageRef(value: string): boolean {
  return value.length > 0 && !value.startsWith("/") && !HTTP_URL.test(value);
}

function resolveImageSrc(ref: string, urls?: ImageLookup): string {
  if (ref.length === 0 || ref.startsWith("/") || HTTP_URL.test(ref)) {
    return ref;
  }
  return urls?.[ref] ?? "";
}

export function CarsList() {
  use(io());
  const cars = useQuery(api.cars.getAvailableCars);
  const settings = useQuery(api.settings.getBusinessSettings);
  const storageIds = useMemo(
    () => Array.from(new Set((cars ?? []).map((car) => car.image).filter(isStorageRef))),
    [cars],
  );
  const imageUrls = useQuery(api.cars.getImageUrls, { storageIds });

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
        <CarCard
          key={car._id}
          car={{ ...car, image: resolveImageSrc(car.image, imageUrls) }}
          settings={settings}
        />
      ))}
    </div>
  );
}
