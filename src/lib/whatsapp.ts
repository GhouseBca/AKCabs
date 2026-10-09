/**
 * Shown to customers when no WhatsApp number is configured in settings.
 * These are the known AK Cabs contact numbers.
 */
export const FALLBACK_WHATSAPP = "8610849962";
export const FALLBACK_PHONE = "9487556868";

/** India country code, prepended to bare 10-digit numbers. */
export const COUNTRY_CODE = "91";

/** Contact fields available from the public business settings. */
export type ContactSettings = {
  phone?: string | null;
  whatsapp?: string | null;
};

function digits(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

function toInternational(raw: string, fallback: string): string {
  const value = raw || fallback;
  return value.length === 10 ? COUNTRY_CODE + value : value;
}

/** Resolves the WhatsApp number (international format) from settings. */
export function getWhatsAppNumber(
  settings?: ContactSettings | null,
): string {
  return toInternational(digits(settings?.whatsapp), FALLBACK_WHATSAPP);
}

/** Resolves the phone number (international format) from settings. */
export function getPhoneNumber(settings?: ContactSettings | null): string {
  return toInternational(digits(settings?.phone), FALLBACK_PHONE);
}

/**
 * General WhatsApp chat link, e.g. https://wa.me/918610849962
 */
export function getWhatsAppLink(settings?: ContactSettings | null): string {
  return `https://wa.me/${getWhatsAppNumber(settings)}`;
}

/**
 * WhatsApp link pre-filled with an enquiry message, e.g.
 * https://wa.me/918610849962?text=Hi%20AK%20Cabs%2C%20...
 */
export function getCarEnquiryLink(
  carName: string,
  settings?: ContactSettings | null,
): string {
  const name = carName.trim();
  if (name.length === 0) {
    throw new Error("Car name is required to build a WhatsApp enquiry link");
  }
  const message = `Hi AK Cabs, I would like to enquire about booking the ${name}.`;
  return `${getWhatsAppLink(settings)}?text=${encodeURIComponent(message)}`;
}

/**
 * WhatsApp link pre-filled with a service enquiry message, e.g.
 * https://wa.me/918610849962?text=Hi%20AK%20Cabs%2C%20...
 */
export function getServiceEnquiryLink(
  serviceName: string,
  settings?: ContactSettings | null,
): string {
  const name = serviceName.trim();
  const message = name
    ? `Hi AK Cabs, I would like to enquire about ${name}.`
    : "Hi AK Cabs, I would like to enquire about your cab services.";
  return `${getWhatsAppLink(settings)}?text=${encodeURIComponent(message)}`;
}

/** tel: link for click-to-call, using the phone number from settings. */
export function getPhoneLink(settings?: ContactSettings | null): string {
  return `tel:+${getPhoneNumber(settings)}`;
}

/** Fields collected by the enquiry form. */
export type EnquiryDetails = {
  name?: string;
  phone?: string;
  pickupLocation?: string;
  destination?: string;
  travelDate?: string;
  passengers?: string | number;
  preferredCar?: string;
  message?: string;
};

/**
 * WhatsApp link pre-filled with a full enquiry message built from the form
 * values, so customers can reach out without filling in the details again.
 */
export function getEnquiryLink(
  details: EnquiryDetails,
  settings?: ContactSettings | null,
): string {
  const lines = ["Hi AK Cabs, I'd like to enquire about a cab."];
  const append = (label: string, value?: string | number) => {
    const text = value === undefined || value === null ? "" : String(value).trim();
    if (text.length > 0) {
      lines.push(`${label}: ${text}`);
    }
  };

  append("Name", details.name);
  append("Phone", details.phone);
  append("Pickup", details.pickupLocation);
  append("Destination", details.destination);
  append("Travel date", details.travelDate);
  append("Passengers", details.passengers);
  append("Preferred car", details.preferredCar);
  append("Message", details.message);

  return `${getWhatsAppLink(settings)}?text=${encodeURIComponent(lines.join("\n"))}`;
}
