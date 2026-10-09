import { Clock, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Section } from "@/components/ui/section";

const REASONS = [
  {
    icon: Clock,
    title: "On-Time Pickups",
    description:
      "We plan every trip around your schedule and reach you on time, every time.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & Courteous Drivers",
    description:
      "Experienced, background-checked drivers who know the roads and treat you well.",
  },
  {
    icon: Sparkles,
    title: "Clean & Comfortable Cars",
    description:
      "Well-maintained, sanitized vehicles so every journey feels relaxed.",
  },
  {
    icon: Wallet,
    title: "Transparent Pricing",
    description:
      "Fair, upfront fares with no hidden charges — you always know what you pay.",
  },
] as const;

export function WhyChoose() {
  return (
    <Section
      id="why-us"
      eyebrow="Why choose us"
      title="Travel with confidence"
      description="Thousands of rides across Tirunelveli and beyond — here's what keeps our customers coming back."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-gold/20 text-charcoal">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
