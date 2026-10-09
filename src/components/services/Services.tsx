import { Suspense } from "react";
import { ServicesGridSkeleton } from "@/components/services/ServicesGridSkeleton";
import { ServicesList } from "@/components/services/ServicesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";

export function Services() {
  return (
    <Section
      id="services"
      eyebrow="What we offer"
      title="Cab services for every journey"
      description="From quick city rides to long outstation trips, AK Cabs covers every kind of travel with a clean, comfortable car and a courteous driver."
    >
      <Suspense fallback={<ServicesGridSkeleton />}>
        <ErrorBoundary
          title="We couldn't load our services"
          description="Please refresh the page or try again in a moment."
        >
          <ServicesList />
        </ErrorBoundary>
      </Suspense>
    </Section>
  );
}
