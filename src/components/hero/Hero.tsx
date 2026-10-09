import { Suspense } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { HeroHighlights } from "@/components/hero/HeroHighlights";
import { HeroImage } from "@/components/hero/HeroImage";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";

const HERO_TITLE = "AK Cabs Tirunelveli";
const HERO_TAGLINE = "Your trusted travel partner";
const HERO_DESCRIPTION =
  "Reliable cab service from Tirunelveli for local travel, outstation trips, airport transfers and memorable tours.";

export function Hero() {
  const whatsappLink = getWhatsAppLink();
  const phoneLink = getPhoneLink();

  return (
    <section id="home" className="relative overflow-hidden bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            <MapPin className="size-3.5" aria-hidden="true" />
            Tirunelveli, Tamil Nadu
          </span>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {HERO_TITLE}
            </h1>
            <p className="text-lg font-medium text-brand">{HERO_TAGLINE}</p>
            <p className="max-w-xl text-base text-pretty text-muted-foreground">
              {HERO_DESCRIPTION}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 px-5 text-sm",
              )}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp Booking
            </a>
            <a
              href={phoneLink}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 gap-2 px-5 text-sm",
              )}
            >
              <Phone className="size-4" aria-hidden="true" />
              Call Now
            </a>
          </div>
        </div>

        <Suspense
          fallback={<Skeleton className="aspect-[4/3] w-full rounded-2xl" />}
        >
          <HeroImage />
        </Suspense>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-14 lg:pb-20">
        <h2 className="sr-only">Our services</h2>
        <Suspense
          fallback={
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          }
        >
          <HeroHighlights />
        </Suspense>
      </div>
    </section>
  );
}
