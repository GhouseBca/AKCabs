import { Suspense } from "react";
import { PricingList } from "@/components/pricing/PricingList";
import { PricingGridSkeleton } from "@/components/pricing/PricingGridSkeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";
import { T } from "@/lib/i18n/T";

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow={<T k="pricing.eyebrow" />}
      title={<T k="pricing.title" />}
      description={<T k="pricing.description" />}
      className="bg-brand-tint"
    >
      <Suspense fallback={<PricingGridSkeleton />}>
        <ErrorBoundary
          title={<T k="pricing.errorTitle" />}
          description={<T k="pricing.errorDescription" />}
        >
          <PricingList />
        </ErrorBoundary>
      </Suspense>
    </Section>
  );
}
