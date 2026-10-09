"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { MobileActionBarView } from "@/components/mobile-bar/MobileActionBarView";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";
import { api } from "../../../convex/_generated/api";

export function MobileActionBar() {
  use(io());
  const settings = useQuery(api.settings.getBusinessSettings);

  return (
    <MobileActionBarView
      whatsappLink={getWhatsAppLink(settings)}
      phoneLink={getPhoneLink(settings)}
    />
  );
}
