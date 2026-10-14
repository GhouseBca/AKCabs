import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

function ServicesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading services"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card-static flex flex-col gap-4 p-5"
        >
          <Skeleton className="size-11 rounded-lg" />
          <Skeleton className="h-5 w-2/3" />
          <SkeletonText lines={2} />
          <Skeleton className="mt-1 h-9 w-32 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export { ServicesGridSkeleton };
