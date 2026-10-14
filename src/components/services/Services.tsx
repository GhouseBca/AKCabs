import { Suspense } from "react";
import { ServicesGridSkeleton } from "@/components/services/ServicesGridSkeleton";
import { ServicesList } from "@/components/services/ServicesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";
import { T } from "@/lib/i18n/T";

export function Services() {
  return (
    <Section
      id="services"
      eyebrow={<T k="services.eyebrow" />}
      title={<T k="services.title" />}
      description={<T k="services.description" />}
    >
      <Suspense fallback={<ServicesGridSkeleton />}>
        <ErrorBoundary
          title={<T k="services.errorTitle" />}
          description={<T k="services.errorDescription" />}
        >
          <ServicesList />
        </ErrorBoundary>
      </Suspense>
    </Section>
  );
}
