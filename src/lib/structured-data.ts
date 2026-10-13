import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { getPhoneNumber } from "@/lib/whatsapp";

/**
 * Schema.org structured data describing AK Cabs as a local taxi business.
 * Rendered as JSON-LD on the home page so crawlers understand who you are,
 * where you operate, and how to contact you.
 */
export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TaxiService"],
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    // "₹₹" = mid-range price tier (Schema.org priceRange)
    priceRange: "₹₹",
    telephone: getPhoneNumber(),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tirunelveli",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "Place", name: "Tirunelveli" },
      { "@type": "Place", name: "Munnar" },
      { "@type": "Place", name: "Kanyakumari" },
      { "@type": "Place", name: "Kodaikanal" },
      { "@type": "Place", name: "Rameswaram" },
      { "@type": "Place", name: "Tamil Nadu" },
    ],
  };
}