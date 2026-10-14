import { Suspense } from "react";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ReviewsSkeleton } from "@/components/reviews/ReviewsSkeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";
import { Toaster } from "@/components/ui/sonner";
import { T } from "@/lib/i18n/T";

export function Reviews() {
  return (
    <Section
      id="reviews"
      eyebrow={<T k="reviews.eyebrow" />}
      title={<T k="reviews.title" />}
      description={<T k="reviews.description" />}
    >
      <Suspense fallback={<ReviewsSkeleton />}>
        <ErrorBoundary
          title={<T k="reviews.errorTitle" />}
          description={<T k="reviews.errorDescription" />}
        >
          <ReviewsList />
        </ErrorBoundary>
      </Suspense>
      <Toaster />
    </Section>
  );
}
