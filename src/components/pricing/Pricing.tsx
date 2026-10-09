import { Suspense } from "react";
import { PricingList } from "@/components/pricing/PricingList";
import { PricingGridSkeleton } from "@/components/pricing/PricingGridSkeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Clear, upfront fares"
      description="No surprises and no hidden charges. Choose the plan that suits your journey — or ask us for a custom quote."
      className="bg-surface"
    >
      <Suspense fallback={<PricingGridSkeleton />}>
        <ErrorBoundary
          title="We couldn't load our pricing"
          description="Please try again in a moment or request a quote on WhatsApp."
        >
          <PricingList />
        </ErrorBoundary>
      </Suspense>
    </Section>
  );
}
