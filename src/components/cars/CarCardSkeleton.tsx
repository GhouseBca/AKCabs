import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function CarCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="car-card-skeleton"
      className={cn(
        "card-static flex flex-col gap-4 overflow-hidden p-4",
        className,
      )}
    >
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-4xl" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-20 rounded-4xl" />
          <Skeleton className="h-5 w-24 rounded-4xl" />
          <Skeleton className="h-5 w-16 rounded-4xl" />
        </div>
        <SkeletonText lines={2} />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function CarGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading cars"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {[...Array(count).keys()].map((index) => (
        <CarCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export { CarCardSkeleton, CarGridSkeleton };
