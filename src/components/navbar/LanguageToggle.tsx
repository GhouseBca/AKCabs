"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  className?: string;
};

function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5",
        className,
      )}
    >
      {(["en", "ta"] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            aria-label={code === "en" ? t("nav.english") : t("nav.tamil")}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {code === "en" ? "EN" : "தமிழ்"}
          </button>
        );
      })}
    </div>
  );
}

export { LanguageToggle };
export type { LanguageToggleProps };
