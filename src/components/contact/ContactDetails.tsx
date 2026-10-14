"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

type ContactItem = {
  key: string;
  icon: typeof Phone;
  labelKey: TranslationKey;
  value: string;
  href?: string;
  external?: boolean;
};

export function ContactDetails() {
  use(io());
  const { t } = useLanguage();
  const settings = useQuery(api.settings.getBusinessSettings);

  const email = settings?.email?.trim() ?? "";
  const address = settings?.address?.trim() ?? "";
  const mapsUrl = settings?.mapsUrl?.trim() ?? "";
  const workingHours = settings?.workingHours?.trim() ?? "";
  const phone = settings?.phone?.trim() ?? "";

  const allItems: ContactItem[] = [
    {
      key: "phone",
      icon: Phone,
      labelKey: "contact.label.phone",
      value: phone,
      href: getPhoneLink(settings),
    },
    {
      key: "email",
      icon: Mail,
      labelKey: "contact.label.email",
      value: email,
      href: email ? `mailto:${email}` : undefined,
    },
    {
      key: "address",
      icon: MapPin,
      labelKey: "contact.label.location",
      value: address,
      href: mapsUrl || undefined,
      external: true,
    },
    {
      key: "hours",
      icon: Clock,
      labelKey: "contact.label.hours",
      value: workingHours,
    },
  ];
  const items = allItems.filter((item) => item.value.length > 0);

  return (
    <div className="card-static flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h3 className="font-heading text-xl font-semibold">
          {t("contact.talkTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("contact.talkDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={getWhatsAppLink(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "h-11 flex-1")}
        >
          <MessageCircle aria-hidden="true" />
          {t("contact.whatsapp")}
        </a>
        <a
          href={getPhoneLink(settings)}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 flex-1",
          )}
        >
          <Phone aria-hidden="true" />
          {t("contact.call")}
        </a>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <span className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t(item.labelKey)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.value}
                </span>
              </span>
            );

            return (
              <li key={item.key} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-brand/10">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="rounded-md transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
