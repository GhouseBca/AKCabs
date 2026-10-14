import type { Doc } from "../../../../convex/_generated/dataModel";

export type ReviewRecord = Doc<"reviews">;
export type ReviewStatus = ReviewRecord["status"];

export const REVIEW_STATUSES: ReviewStatus[] = [
  "pending",
  "approved",
  "hidden",
];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  hidden: "Hidden",
};

export const REVIEW_STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  hidden: "bg-muted text-muted-foreground",
};
