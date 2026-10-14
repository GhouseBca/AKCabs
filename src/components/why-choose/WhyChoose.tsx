import { Clock, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { T } from "@/lib/i18n/T";
import type { TranslationKey } from "@/lib/i18n/en";

const REASONS: ReadonlyArray<{
  icon: LucideIcon;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}> = [
  {
    icon: Clock,
    titleKey: "why.onTime.title",
    descriptionKey: "why.onTime.description",
  },
  {
    icon: ShieldCheck,
    titleKey: "why.drivers.title",
    descriptionKey: "why.drivers.description",
  },
  {
    icon: Sparkles,
    titleKey: "why.cars.title",
    descriptionKey: "why.cars.description",
  },
  {
    icon: Wallet,
    titleKey: "why.pricing.title",
    descriptionKey: "why.pricing.description",
  },
];

export function WhyChoose() {
  return (
    <Section
      id="why-us"
      eyebrow={<T k="why.eyebrow" />}
      title={<T k="why.title" />}
      description={<T k="why.description" />}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ icon: Icon, titleKey, descriptionKey }) => (
          <li
            key={titleKey}
            className="card-lift reveal flex flex-col gap-3 p-5"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-gold/15 text-charcoal ring-1 ring-gold/30">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-base font-semibold">
              <T k={titleKey} />
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <T k={descriptionKey} />
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
