"use client";

import { use } from "react";
import { io } from "next/cache";
import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewsSkeleton } from "@/components/reviews/ReviewsSkeleton";
import { StarDisplay } from "@/components/reviews/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { api } from "../../../convex/_generated/api";

const reviewDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});

const MAX_STATIC_REVIEWS = 3;
const MIN_SCROLL_SECONDS = 25;
const MAX_SCROLL_SECONDS = 40;
const SECONDS_PER_REVIEW = 2.5;

type ReviewItem = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  location?: string;
  createdAt: number;
};

function ReviewSummary({ average, count }: { average: number; count: number }) {
  const { t } = useLanguage();

  return (
    <div className="card-static reveal flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-4">
        <span className="font-heading text-4xl font-bold tabular-nums text-primary">
          {average.toFixed(1)}
        </span>
        <div className="flex flex-col gap-1">
          <StarDisplay rating={average} />
          <p className="text-sm text-muted-foreground">
            {count === 0
              ? t("reviews.noApproved")
              : t(count === 1 ? "reviews.basedOnOne" : "reviews.basedOn", {
                  count,
                })}
          </p>
        </div>
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("reviews.trust")}
      </p>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <li className="card-lift mb-4 flex flex-col gap-3 overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold">
            {review.name}
          </p>
          {review.location ? (
            <p className="truncate text-xs text-muted-foreground">
              {review.location}
            </p>
          ) : null}
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="flex-1 text-sm leading-relaxed break-words whitespace-pre-wrap text-muted-foreground">
        {review.comment}
      </p>
      <time
        className="text-xs text-muted-foreground"
        dateTime={new Date(review.createdAt).toISOString()}
      >
        {reviewDateFormatter.format(new Date(review.createdAt))}
      </time>
    </li>
  );
}

function ReviewsScroller({
  reviews,
  durationSeconds,
}: {
  reviews: ReviewItem[];
  durationSeconds: number;
}) {
  const { t } = useLanguage();

  return (
    <div
      role="region"
      tabIndex={0}
      aria-label={t("reviews.title")}
      className="reviews-scroll-box reveal relative h-[30rem] rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="reviews-scroll-viewport h-full overflow-x-hidden">
        <div
          className="reviews-scroll-track"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          <ul className="flex flex-col">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </ul>
          <ul className="flex flex-col" aria-hidden="true">
            {reviews.map((review) => (
              <ReviewCard key={`clone-${review._id}`} review={review} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ReviewsList() {
  use(io());
  const { t } = useLanguage();
  const reviews = useQuery(api.reviews.getApprovedReviews, { limit: 12 });
  const stats = useQuery(api.reviews.getReviewStats);

  if (reviews === undefined || stats === undefined) {
    return <ReviewsSkeleton />;
  }

  const shouldAutoScroll = reviews.length > MAX_STATIC_REVIEWS;
  const durationSeconds = Math.min(
    MAX_SCROLL_SECONDS,
    MIN_SCROLL_SECONDS +
      (reviews.length - MAX_STATIC_REVIEWS) * SECONDS_PER_REVIEW,
  );

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <ReviewSummary average={stats.average} count={stats.count} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
        <div className="min-w-0">
          {reviews.length === 0 ? (
            <EmptyState
              icon={<Star className="size-6" />}
              title={t("reviews.emptyTitle")}
              description={t("reviews.emptyDescription")}
            />
          ) : shouldAutoScroll ? (
            <ReviewsScroller
              reviews={reviews}
              durationSeconds={durationSeconds}
            />
          ) : (
            <ul className="reveal flex flex-col">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
