import { Suspense } from "react";
import { CarsList } from "@/components/cars/CarsList";
import { CarGridSkeleton } from "@/components/cars/CarCardSkeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";

export function Cars() {
  return (
    <Section
      id="cars"
      eyebrow="Our fleet"
      title="Well-maintained cars for every trip"
      description="From compact sedans to spacious SUVs, pick the ride that fits your group and budget — each one clean, comfortable, and ready to go."
      className="bg-surface"
    >
      <Suspense fallback={<CarGridSkeleton />}>
        <ErrorBoundary
          title="We couldn't load our cars"
          description="Please try again in a moment or contact us directly on WhatsApp."
        >
          <CarsList />
        </ErrorBoundary>
      </Suspense>
    </Section>
  );
}
