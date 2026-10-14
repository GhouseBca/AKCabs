"use client";

import Link from "next/link";
import { CarFront } from "lucide-react";
import { Suspense } from "react";
import { FooterData } from "@/components/footer/FooterData";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";

const QUICK_LINKS: ReadonlyArray<{ labelKey: TranslationKey; href: string }> = [
  { labelKey: "nav.home", href: "/#home" },
  { labelKey: "nav.services", href: "/#services" },
  { labelKey: "nav.cars", href: "/#cars" },
  { labelKey: "nav.pricing", href: "/#pricing" },
  { labelKey: "nav.contact", href: "/#contact" },
];

function FooterFallback() {
  const { t } = useLanguage();

  return (
    <>
      <div>
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {t("footer.services")}
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-32" />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {t("footer.contact")}
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-40" />
          ))}
        </div>
      </div>
    </>
  );
}

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/#home"
            className="inline-flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              AK Cabs
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>

        <nav aria-label={t("footer.quickLinksAria")}>
          <h2 className="font-heading text-sm font-semibold text-foreground">
            {t("footer.quickLinks")}
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Suspense fallback={<FooterFallback />}>
          <FooterData />
        </Suspense>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
