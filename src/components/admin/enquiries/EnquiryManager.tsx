"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  Eye,
  Inbox,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EnquiryViewDialog } from "@/components/admin/enquiries/EnquiryViewDialog";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  getCustomerPhoneLink,
  getCustomerWhatsAppLink,
  type EnquiryRecord,
  type EnquiryStatus,
} from "@/components/admin/enquiries/enquiry-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime } from "@/lib/utils";

type StatusFilter = "all" | EnquiryStatus;

function EnquiryManager() {
  return (
    <ErrorBoundary
      title="Couldn't load enquiries"
      description="There was a problem loading customer enquiries. Please try again."
    >
      <EnquiryManagerContent />
    </ErrorBoundary>
  );
}

function EnquiryManagerContent() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const enquiries = useQuery(
    api.enquiries.getEnquiries,
    statusFilter === "all" ? {} : { status: statusFilter },
  ) as EnquiryRecord[] | undefined;

  const updateStatus = useMutation(api.enquiries.updateEnquiryStatus);
  const deleteEnquiry = useMutation(api.enquiries.deleteEnquiry);

  const [viewTarget, setViewTarget] = useState<EnquiryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnquiryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatus(enquiry: EnquiryRecord, status: EnquiryStatus) {
    if (status === enquiry.status) {
      return;
    }
    setBusyId(enquiry._id);
    try {
      await updateStatus({ id: enquiry._id, status });
      toast.success(`Marked as ${ENQUIRY_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    try {
      await deleteEnquiry({ id: deleteTarget._id });
      toast.success("Enquiry deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the enquiry.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Enquiries"
        description="Review customer enquiries and keep track of their status."
        action={
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[160px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ENQUIRY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {ENQUIRY_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {enquiries === undefined ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title={
            statusFilter === "all" ? "No enquiries yet" : "No matching enquiries"
          }
          description={
            statusFilter === "all"
              ? "New enquiries submitted on the website will appear here."
              : "Try a different status filter to see more enquiries."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Pickup</Th>
                <Th>Destination</Th>
                <Th>Date</Th>
                <Th>Pax</Th>
                <Th>Car</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => {
                const busy = busyId === enquiry._id;
                return (
                  <tr
                    key={enquiry._id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30",
                      busy && "opacity-70",
                    )}
                  >
                    <td className="px-3 py-2.5 font-medium">
                      {enquiry.name}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <a
                        href={getCustomerPhoneLink(enquiry.phone)}
                        className="text-primary hover:underline"
                      >
                        {enquiry.phone}
                      </a>
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-2.5">
                      {enquiry.pickupLocation}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-2.5">
                      {enquiry.destination}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {enquiry.travelDate}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {enquiry.passengers}
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-2.5 text-muted-foreground">
                      {enquiry.preferredCar || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Select
                        value={enquiry.status}
                        onValueChange={(value) =>
                          handleStatus(enquiry, value as EnquiryStatus)
                        }
                        disabled={busy}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-[128px]"
                          aria-label={`Change status for ${enquiry.name}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENQUIRY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {ENQUIRY_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(enquiry.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setViewTarget(enquiry)}
                          aria-label={`View enquiry from ${enquiry.name}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <a
                          href={getCustomerPhoneLink(enquiry.phone)}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                            }),
                          )}
                          aria-label={`Call ${enquiry.name}`}
                        >
                          <Phone className="size-4" />
                        </a>
                        <a
                          href={getCustomerWhatsAppLink(enquiry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                            }),
                            "text-emerald-600 hover:text-emerald-600 dark:text-emerald-400",
                          )}
                          aria-label={`WhatsApp ${enquiry.name}`}
                        >
                          <MessageCircle className="size-4" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(enquiry)}
                          aria-label={`Delete enquiry from ${enquiry.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EnquiryViewDialog
        enquiry={viewTarget}
        open={viewTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete enquiry"
        description={
          deleteTarget
            ? `The enquiry from ${deleteTarget.name} will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-3 py-2.5 font-medium", className)} scope="col">
      {children}
    </th>
  );
}

export { EnquiryManager };
