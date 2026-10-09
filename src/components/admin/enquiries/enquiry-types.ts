import type { Doc } from "../../../../convex/_generated/dataModel";

export type EnquiryRecord = Doc<"enquiries">;
export type EnquiryStatus = EnquiryRecord["status"];

export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "new",
  "contacted",
  "completed",
  "cancelled",
];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ENQUIRY_STATUS_BADGE: Record<EnquiryStatus, string> = {
  new: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  contacted: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-destructive/15 text-destructive",
};

function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/** tel: link for click-to-call on the customer's number. */
export function getCustomerPhoneLink(phone: string): string {
  return `tel:+${toInternational(phone)}`;
}

/** wa.me link to message the customer, pre-filled with a follow-up. */
export function getCustomerWhatsAppLink(enquiry: EnquiryRecord): string {
  const message = `Hi ${enquiry.name}, this is AK Cabs regarding your enquiry for a trip from ${enquiry.pickupLocation} to ${enquiry.destination} on ${enquiry.travelDate}.`;
  return `https://wa.me/${toInternational(enquiry.phone)}?text=${encodeURIComponent(
    message,
  )}`;
}
