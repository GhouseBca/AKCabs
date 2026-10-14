"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Eye, Star, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ReviewViewDialog } from "@/components/admin/reviews/ReviewViewDialog";
import {
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  type ReviewRecord,
  type ReviewStatus,
} from "@/components/admin/reviews/review-types";
import { StarDisplay } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
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

type StatusFilter = "all" | ReviewStatus;

function ReviewsManager() {
  return (
    <ErrorBoundary
      title="Couldn't load reviews"
      description="There was a problem loading customer reviews. Please try again."
    >
      <ReviewsManagerContent />
    </ErrorBoundary>
  );
}

function ReviewsManagerContent() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const reviews = useQuery(
    api.reviews.getAllReviews,
    statusFilter === "all" ? {} : { status: statusFilter },
  ) as ReviewRecord[] | undefined;

  const updateStatus = useMutation(api.reviews.updateReviewStatus);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const [viewTarget, setViewTarget] = useState<ReviewRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatus(review: ReviewRecord, status: ReviewStatus) {
    if (status === review.status) {
      return;
    }
    setBusyId(review._id);
    try {
      await updateStatus({ id: review._id, status });
      toast.success(`Review marked as ${REVIEW_STATUS_LABELS[status].toLowerCase()}.`);
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
      await deleteReview({ id: deleteTarget._id });
      toast.success("Review deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the review.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reviews"
        description="Approve, hide, or remove customer reviews before they appear on the site."
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
              {REVIEW_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {REVIEW_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {reviews === undefined ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="size-6" />}
          title={
            statusFilter === "all" ? "No reviews yet" : "No matching reviews"
          }
          description={
            statusFilter === "all"
              ? "Reviews submitted on the website will appear here for approval."
              : "Try a different status filter to see more reviews."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <Th>Name</Th>
                <Th>Rating</Th>
                <Th>Review</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => {
                const busy = busyId === review._id;
                return (
                  <tr
                    key={review._id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30",
                      busy && "opacity-70",
                    )}
                  >
                    <td className="px-3 py-2.5 font-medium">{review.name}</td>
                    <td className="px-3 py-2.5">
                      <StarDisplay rating={review.rating} />
                    </td>
                    <td className="max-w-[320px] truncate px-3 py-2.5 text-muted-foreground">
                      {review.comment}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-2.5 text-muted-foreground">
                      {review.location || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Select
                        value={review.status}
                        onValueChange={(value) =>
                          handleStatus(review, value as ReviewStatus)
                        }
                        disabled={busy}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-[128px]"
                          aria-label={`Change status for ${review.name}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REVIEW_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {REVIEW_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(review.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setViewTarget(review)}
                          aria-label={`View review from ${review.name}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(review)}
                          aria-label={`Delete review from ${review.name}`}
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

      <ReviewViewDialog
        review={viewTarget}
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
        title="Delete review"
        description={
          deleteTarget
            ? `The review from ${deleteTarget.name} will be permanently removed.`
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

export { ReviewsManager };
