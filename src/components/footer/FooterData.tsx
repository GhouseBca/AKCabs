"use client";

import { use } from "react";
import { io } from "next/cache";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { DEFAULT_SERVICES } from "@/lib/default-services";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

export function FooterData() {
  use(io());
  const settings = useQuery(api.settings.getBusinessSettings);
  const services = useQuery(api.services.getServices);

  const serviceTitles =
    services && services.length > 0
      ? services.map((service) => service.title)
      : DEFAULT_SERVICES.map((service) => service.title);

  const phone = settings?.phone?.trim() ?? "";
  const email = settings?.email?.trim() ?? "";
  const address = settings?.address?.trim() ?? "";

  return (
    <>
      <div>
        <h2 className="font-heading text-sm font-semibold">Services</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
          {serviceTitles.slice(0, 6).map((title) => (
            <li key={title}>
              <Link
                href="/#services"
                className="rounded-lg transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-heading text-sm font-semibold">Contact</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <a
              href={getWhatsAppLink(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </a>
          </li>
          <li>
            <a
              href={getPhoneLink(settings)}
              className="inline-flex items-center gap-2 rounded-lg transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Phone className="size-4" aria-hidden="true" />
              {phone || "Call us"}
            </a>
          </li>
          {email ? (
            <li>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-lg transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Mail className="size-4" aria-hidden="true" />
                {email}
              </a>
            </li>
          ) : null}
          {address ? (
            <li className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {address}
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
}
