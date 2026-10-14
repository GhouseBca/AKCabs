import { Suspense } from "react";
import { CarsList } from "@/components/cars/CarsList";
import { CarGridSkeleton } from "@/components/cars/CarCardSkeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";
import { T } from "@/lib/i18n/T";

export function Cars() {
  return (
    <Section
      id="cars"
      eyebrow={<T k="cars.eyebrow" />}
      title={<T k="cars.title" />}
      description={<T k="cars.description" />}
      className="bg-brand-tint"
    >
      <Suspense fallback={<CarGridSkeleton />}>
        <ErrorBoundary
          title={<T k="cars.errorTitle" />}
          description={<T k="cars.errorDescription" />}
        >
          <CarsList />
        </ErrorBoundary>
      </Suspense>
    </Section>
  );
}
