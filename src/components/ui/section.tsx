import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
};

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  headerClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 lg:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className={cn("mb-10 max-w-2xl", headerClassName)}>
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold tracking-wide text-brand uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export { Section };
export type { SectionProps };
