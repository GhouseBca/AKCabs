"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  REVIEW_STATUS_BADGE,
  REVIEW_STATUS_LABELS,
  type ReviewRecord,
} from "@/components/admin/reviews/review-types";
import { StarDisplay } from "@/components/reviews/star-rating";
import { cn, formatDateTime } from "@/lib/utils";

type ReviewViewDialogProps = {
  review: ReviewRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ReviewViewDialog({
  review,
  open,
  onOpenChange,
}: ReviewViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{review?.name ?? "Review"}</DialogTitle>
          <DialogDescription>
            {review ? `Received ${formatDateTime(review.createdAt)}` : "Review details"}
          </DialogDescription>
        </DialogHeader>

        {review ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent",
                  REVIEW_STATUS_BADGE[review.status],
                )}
              >
                {REVIEW_STATUS_LABELS[review.status]}
              </Badge>
              <StarDisplay rating={review.rating} />
            </div>

            <Separator />

            {review.location ? (
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  City or route
                </p>
                <p className="text-sm">{review.location}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Review
              </p>
              <p className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                {review.comment}
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { ReviewViewDialog };
export type { ReviewViewDialogProps };
