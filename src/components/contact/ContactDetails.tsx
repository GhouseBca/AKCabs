"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

type ContactItem = {
  key: string;
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export function ContactDetails() {
  use(io());
  const settings = useQuery(api.settings.getBusinessSettings);

  const email = settings?.email?.trim() ?? "";
  const address = settings?.address?.trim() ?? "";
  const mapsUrl = settings?.mapsUrl?.trim() ?? "";
  const workingHours = settings?.workingHours?.trim() ?? "";
  const phone = settings?.phone?.trim() ?? "";

  const items: ContactItem[] = [
    {
      key: "phone",
      icon: Phone,
      label: "Phone",
      value: phone,
      href: getPhoneLink(settings),
    },
    {
      key: "email",
      icon: Mail,
      label: "Email",
      value: email,
      href: email ? `mailto:${email}` : undefined,
    },
    {
      key: "address",
      icon: MapPin,
      label: "Location",
      value: address,
      href: mapsUrl || undefined,
      external: true,
    },
    {
      key: "hours",
      icon: Clock,
      label: "Working hours",
      value: workingHours,
    },
  ].filter((item) => item.value.length > 0);

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <div className="space-y-1">
        <h3 className="font-heading text-xl font-semibold">
          Talk to us directly
        </h3>
        <p className="text-sm text-muted-foreground">
          Ready to book or have a question? Reach out — we usually reply within
          minutes.
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
          WhatsApp
        </a>
        <a
          href={getPhoneLink(settings)}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 flex-1",
          )}
        >
          <Phone aria-hidden="true" />
          Call
        </a>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <span className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.value}
                </span>
              </span>
            );

            return (
              <li key={item.key} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
