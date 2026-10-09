import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

function PricingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading pricing"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-16 rounded-4xl" />
          </div>
          <Skeleton className="h-8 w-24" />
          <SkeletonText lines={3} />
        </div>
      ))}
    </div>
  );
}

export { PricingGridSkeleton };
