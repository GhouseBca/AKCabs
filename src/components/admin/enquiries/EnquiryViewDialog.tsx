"use client";

import { MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ENQUIRY_STATUS_BADGE,
  ENQUIRY_STATUS_LABELS,
  getCustomerPhoneLink,
  getCustomerWhatsAppLink,
  type EnquiryRecord,
} from "@/components/admin/enquiries/enquiry-types";
import { cn, formatDateTime } from "@/lib/utils";

type EnquiryViewDialogProps = {
  enquiry: EnquiryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EnquiryViewDialog({
  enquiry,
  open,
  onOpenChange,
}: EnquiryViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{enquiry?.name ?? "Enquiry"}</DialogTitle>
          <DialogDescription>
            {enquiry
              ? `Received ${formatDateTime(enquiry.createdAt)}`
              : "Enquiry details"}
          </DialogDescription>
        </DialogHeader>

        {enquiry ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent",
                  ENQUIRY_STATUS_BADGE[enquiry.status],
                )}
              >
                {ENQUIRY_STATUS_LABELS[enquiry.status]}
              </Badge>
              <a
                href={getCustomerPhoneLink(enquiry.phone)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {enquiry.phone}
              </a>
            </div>

            <Separator />

            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Pickup" value={enquiry.pickupLocation} />
              <Detail label="Destination" value={enquiry.destination} />
              <Detail label="Travel date" value={enquiry.travelDate} />
              <Detail
                label="Passengers"
                value={String(enquiry.passengers)}
              />
              <Detail
                label="Preferred car"
                value={enquiry.preferredCar || "Not specified"}
              />
            </dl>

            {enquiry.message ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Message
                </p>
                <p className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {enquiry.message}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <a
                href={getCustomerPhoneLink(enquiry.phone)}
                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
              >
                <Phone aria-hidden="true" />
                Call
              </a>
              <a
                href={getCustomerWhatsAppLink(enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants(), "gap-2")}
              >
                <MessageCircle aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type DetailProps = {
  label: string;
  value: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export { EnquiryViewDialog };
export type { EnquiryViewDialogProps };
