import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

function ReviewsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading customer reviews"
      className="flex flex-col gap-10"
    >
      <div className="card-static flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-16" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="card-static flex flex-col gap-3 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <SkeletonText lines={3} />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="card-static flex flex-col gap-4 p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export { ReviewsSkeleton };
