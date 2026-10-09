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
  image: string;
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

function lowestRate(car: Car): { amount: number; unit: string } | null {
  const candidates: Array<{ amount: number; unit: string }> = [];
  if (car.perKmRate) candidates.push({ amount: car.perKmRate, unit: "per km" });
  if (car.localRate) {
    candidates.push({ amount: car.localRate, unit: "local trip" });
  }
  if (car.outstationRate) {
    candidates.push({ amount: car.outstationRate, unit: "outstation" });
  }
  if (car.airportRate) {
    candidates.push({ amount: car.airportRate, unit: "airport" });
  }
  if (car.fullDayRate) {
    candidates.push({ amount: car.fullDayRate, unit: "per day" });
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
  const rate = lowestRate(car);
  const features = car.features.slice(0, 4);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <div className="relative">
        <CarImage
          src={car.image}
          alt={`${car.name} available for booking with AK Cabs`}
        />
        <Badge
          variant={car.available ? "default" : "destructive"}
          className="absolute top-3 left-3 shadow-sm"
        >
          {car.available ? "Available" : "Not available"}
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
              {car.seatingCapacity} Seater
            </Badge>
          </li>
          <li>
            <Badge variant="secondary">
              {car.acAvailable ? (
                <Snowflake aria-hidden="true" />
              ) : (
                <Wind aria-hidden="true" />
              )}
              {car.acAvailable ? "AC" : "Non-AC"}
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

        <div className="mt-auto flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {rate?.unit ? `Starting from (${rate.unit})` : "Pricing"}
            </p>
            <p className="font-heading text-2xl font-bold">
              {formatPrice(rate?.amount)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={getCarEnquiryLink(car.name, settings)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "flex-1")}
            >
              <MessageCircle aria-hidden="true" />
              Book on WhatsApp
            </a>
            <a
              href={getPhoneLink(settings)}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1",
              )}
            >
              <Phone aria-hidden="true" />
              Call
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export { CarCard };
export type { Car };
