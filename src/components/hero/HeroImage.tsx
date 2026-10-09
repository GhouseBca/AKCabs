"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { CarImage } from "@/components/cars/CarImage";
import { api } from "../../../convex/_generated/api";

const HTTP_URL = /^https?:\/\//i;

export function HeroImage() {
  use(io());
  const settings = useQuery(api.settings.getBusinessSettings);
  const heroImage = settings?.heroImage ?? "";
  const isStorageId = heroImage.length > 0 && !HTTP_URL.test(heroImage);
  const urls = useQuery(api.cars.getImageUrls, {
    storageIds: isStorageId ? [heroImage] : [],
  });

  const src = isStorageId
    ? (urls?.[heroImage] ?? undefined)
    : heroImage || undefined;

  return (
    <CarImage
      src={src}
      alt="Comfortable AK Cabs vehicle ready for your trip in Tirunelveli"
      aspectRatio="4 / 3"
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
      className="rounded-2xl shadow-xl ring-1 ring-foreground/10"
    />
  );
}
