"use client";

import {
  Check,
  Fuel,
  Gauge,
  MessageCircle,
  Phone,
  Snowflake,
  Users,
  Wind,
} from "lucide-react";
import { CarImage } from "@/components/cars/CarImage";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn, formatPrice } from "@/lib/utils";
import {
  getCarEnquiryLink,
  getPhoneLink,
  type ContactSettings,
} from "@/lib/whatsapp";

type Car = {
  _id: string;
  name: string;
  model: string;
  year?: number;
  imageUrl?: string | null;
  seatingCapacity: number;
  acAvailable: boolean;
  fuelType: string;
  transmission: string;
  description: string;
  features: string[];
  localRate?: number;
  outstationRate?: number;
  airportRate?: number;
  fullDayRate?: number;
  perKmRate?: number;
  available: boolean;
};

function lowestRate(
  car: Car,
): { amount: number; unitKey: TranslationKey } | null {
  const candidates: Array<{ amount: number; unitKey: TranslationKey }> = [];
  if (car.perKmRate) {
    candidates.push({ amount: car.perKmRate, unitKey: "cars.unit.perKm" });
  }
  if (car.localRate) {
    candidates.push({ amount: car.localRate, unitKey: "cars.unit.local" });
  }
  if (car.outstationRate) {
    candidates.push({
      amount: car.outstationRate,
      unitKey: "cars.unit.outstation",
    });
  }
  if (car.airportRate) {
    candidates.push({ amount: car.airportRate, unitKey: "cars.unit.airport" });
  }
  if (car.fullDayRate) {
    candidates.push({ amount: car.fullDayRate, unitKey: "cars.unit.perDay" });
  }
  if (candidates.length === 0) {
    return null;
  }
  return candidates.reduce((lowest, candidate) =>
    candidate.amount < lowest.amount ? candidate : lowest,
  );
}

function CarCard({
  car,
  settings,
}: {
  car: Car;
  settings?: ContactSettings | null;
}) {
  const { t, lang } = useLanguage();
  const rate = lowestRate(car);
  const features = car.features.slice(0, 4);
  const isTamil = lang === "ta";

  return (
    <article className="card-lift reveal group flex flex-col overflow-hidden">
      <div className="relative">
        <CarImage
          src={car.imageUrl}
          alt={t("cars.imageAlt", { name: car.name })}
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <Badge
          variant={car.available ? "default" : "destructive"}
          className="absolute top-3 left-3 shadow-sm"
        >
          {car.available ? t("cars.available") : t("cars.notAvailable")}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-heading text-lg font-semibold">{car.name}</h3>
          <p className="text-sm text-muted-foreground">
            {car.model}
            {car.year ? ` · ${car.year}` : ""}
          </p>
        </div>

        <ul className="flex flex-wrap gap-2">
          <li>
            <Badge variant="secondary">
              <Users aria-hidden="true" />
              {t("cars.seater", { count: car.seatingCapacity })}
            </Badge>
          </li>
          <li>
            <Badge variant="secondary">
              {car.acAvailable ? (
                <Snowflake aria-hidden="true" />
              ) : (
                <Wind aria-hidden="true" />
              )}
              {car.acAvailable ? t("cars.ac") : t("cars.nonAc")}
            </Badge>
          </li>
          <li>
            <Badge variant="secondary">
              <Fuel aria-hidden="true" />
              {car.fuelType}
            </Badge>
          </li>
          <li>
            <Badge variant="secondary">
              <Gauge aria-hidden="true" />
              {car.transmission}
            </Badge>
          </li>
        </ul>

        {features.length > 0 ? (
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-4 border-t border-border/80 pt-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {rate
                ? t("cars.startingFrom", { unit: t(rate.unitKey) })
                : t("cars.pricing")}
            </p>
            <p className="font-heading text-2xl font-bold text-primary">
              {rate
                ? formatPrice(rate.amount)
                : t("common.contactForPrice")}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={getCarEnquiryLink(car.name, settings)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "flex-1 shadow-sm shadow-brand/20",
                isTamil && "text-xs",
              )}
            >
              <MessageCircle aria-hidden="true" />
              {t("cars.bookWhatsApp")}
            </a>
            <a
              href={getPhoneLink(settings)}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1",
                isTamil && "text-xs",
              )}
            >
              <Phone aria-hidden="true" />
              {t("cars.call")}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export { CarCard };
export type { Car };
