"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

type StarDisplayProps = {
  rating: number;
  className?: string;
};

function StarDisplay({ rating, className }: StarDisplayProps) {
  const { t } = useLanguage();
  const rounded = Math.round(rating);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={t("reviews.starsAria", { rating: rating.toFixed(1) })}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0",
            star <= rounded
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

type StarInputProps = {
  value: number;
  onChange: (value: number) => void;
  name?: string;
  id?: string;
  describedBy?: string;
  invalid?: boolean;
};

function StarInput({
  value,
  onChange,
  name = "rating",
  id,
  describedBy,
  invalid = false,
}: StarInputProps) {
  const { t } = useLanguage();

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={t("reviews.ratingAria")}
      aria-describedby={describedBy}
      tabIndex={-1}
      className={cn(
        "flex w-fit items-center gap-1 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        invalid && "ring-1 ring-destructive/40",
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <label
          key={star}
          className="group/star cursor-pointer rounded-md p-0.5 outline-none focus-within:ring-3 focus-within:ring-ring/50"
        >
          <input
            type="radio"
            name={name}
            value={star}
            checked={value === star}
            onChange={() => onChange(star)}
            className="sr-only"
            aria-label={t(
              star === 1 ? "reviews.starAria" : "reviews.starAriaPlural",
              { star },
            )}
          />
          <Star
            aria-hidden="true"
            className={cn(
              "size-7 transition duration-150 group-hover/star:scale-110",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
          />
        </label>
      ))}
    </div>
  );
}

export { StarDisplay, StarInput };
export type { StarDisplayProps, StarInputProps };
