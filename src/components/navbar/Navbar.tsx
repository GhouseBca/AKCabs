"use client";

import Link from "next/link";
import { CarFront, Menu } from "lucide-react";
import { LanguageToggle } from "@/components/navbar/LanguageToggle";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";

const NAV_LINKS: ReadonlyArray<{ labelKey: TranslationKey; href: string }> = [
  { labelKey: "nav.home", href: "/#home" },
  { labelKey: "nav.services", href: "/#services" },
  { labelKey: "nav.cars", href: "/#cars" },
  { labelKey: "nav.pricing", href: "/#pricing" },
  { labelKey: "nav.contact", href: "/#contact" },
];

export function Navbar() {
  const { t } = useLanguage();
  const whatsappLink = getWhatsAppLink();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 shadow-[0_1px_3px_rgb(15_61_34/0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav
        aria-label={t("nav.main")}
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4"
      >
        <Link
          href="/#home"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-brand to-brand-dark text-primary-foreground shadow-sm shadow-brand/25">
            <CarFront className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            AK Cabs
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/5 hover:text-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden md:inline-flex" />
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "px-3 shadow-sm shadow-brand/20",
            )}
          >
            {t("nav.bookNow")}
          </a>

          <Sheet>
            <SheetTrigger
              aria-label={t("nav.openMenu")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden",
              )}
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{t("nav.menu")}</SheetTitle>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose
                      render={<Link href={link.href} />}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {t(link.labelKey)}
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 p-4">
                <LanguageToggle />
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
                >
                  {t("nav.bookWhatsApp")}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
