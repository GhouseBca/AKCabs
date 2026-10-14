import { Suspense } from "react";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { T } from "@/lib/i18n/T";

function ContactDetailsSkeleton() {
  return (
    <div className="card-static flex flex-col gap-6 p-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 flex-1 rounded-lg" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnquiryFormSkeleton() {
  return (
    <div className="card-static flex flex-col gap-5 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow={<T k="contact.eyebrow" />}
      title={<T k="contact.title" />}
      description={<T k="contact.description" />}
      className="bg-brand-tint"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <Suspense fallback={<ContactDetailsSkeleton />}>
          <ErrorBoundary
            title={<T k="contact.errorDetailsTitle" />}
            description={<T k="contact.errorDetailsDescription" />}
          >
            <ContactDetails />
          </ErrorBoundary>
        </Suspense>

        <Suspense fallback={<EnquiryFormSkeleton />}>
          <ErrorBoundary
            title={<T k="contact.errorFormTitle" />}
            description={<T k="contact.errorFormDescription" />}
          >
            <EnquiryForm />
          </ErrorBoundary>
        </Suspense>
      </div>
    </Section>
  );
}
