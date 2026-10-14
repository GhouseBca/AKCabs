import { Suspense } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { HeroHighlights } from "@/components/hero/HeroHighlights";
import { HeroImage } from "@/components/hero/HeroImage";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { T } from "@/lib/i18n/T";
import { cn } from "@/lib/utils";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";

const HERO_TITLE = "AK Cabs Tirunelveli";

export function Hero() {
  const whatsappLink = getWhatsAppLink();
  const phoneLink = getPhoneLink();

  return (
    <section
      id="home"
      className="relative scroll-mt-18 overflow-hidden bg-linear-to-b from-brand-tint to-surface"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20">
        <div className="enter-up flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand uppercase ring-1 ring-brand/15">
            <MapPin className="size-3.5" aria-hidden="true" />
            <T k="hero.badge" />
          </span>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {HERO_TITLE}
            </h1>
            <p className="text-lg font-semibold text-brand">
              <T k="hero.tagline" />
            </p>
            <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground">
              <T k="hero.description" />
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 rounded-xl px-5 text-sm shadow-lg shadow-brand/25 transition-shadow hover:shadow-xl hover:shadow-brand/30",
              )}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              <T k="hero.whatsapp" />
            </a>
            <a
              href={phoneLink}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 gap-2 rounded-xl border-brand/25 bg-background/80 px-5 text-sm backdrop-blur",
              )}
            >
              <Phone className="size-4" aria-hidden="true" />
              <T k="hero.call" />
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
        <h2 className="sr-only">
          <T k="hero.servicesSr" />
        </h2>
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
