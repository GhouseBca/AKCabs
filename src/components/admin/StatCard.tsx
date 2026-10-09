import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone = "brand" | "emerald" | "amber" | "sky";

const TONE_CLASSES: Record<StatTone, string> = {
  brand: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: StatTone;
};

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "brand",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl font-semibold tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

export { StatCard };
export type { StatCardProps, StatTone };
