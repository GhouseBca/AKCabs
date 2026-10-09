import type { ReactNode } from "react";
import { Construction } from "lucide-react";

type SectionPlaceholderProps = {
  title: string;
  description?: ReactNode;
};

function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Construction className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { SectionPlaceholder };
export type { SectionPlaceholderProps };
