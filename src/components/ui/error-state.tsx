"use client";

import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: ReactNode;
  /** Overrides the default alert icon. */
  icon?: ReactNode;
  /** Renders a retry button that calls this handler. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Custom action slot; takes precedence over the retry button. */
  action?: ReactNode;
  className?: string;
};

function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  icon,
  onRetry,
  retryLabel = "Try again",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      >
        {icon ?? <TriangleAlert className="size-6" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="mt-1">{action}</div>
      ) : onRetry ? (
        <Button variant="outline" size="sm" className="mt-1" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { ErrorState };
export type { ErrorStateProps };
