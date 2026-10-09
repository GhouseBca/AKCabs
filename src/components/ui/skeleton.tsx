import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {[...Array(lines).keys()].map((index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="card-skeleton"
      className={cn(
        "flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10",
        className,
      )}
    >
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-5 w-3/4" />
        <SkeletonText lines={2} />
      </div>
      <div className="flex gap-2 px-1">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, CardSkeleton };
