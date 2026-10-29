import { Quote } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Marquee } from "@/components/ui/marquee";
import { testimonials } from "@/features/home/data";
import { cn } from "@/lib/utils";

import { SectionIntro } from "./section-intro";

type Testimonial = (typeof testimonials)[number];

function ReviewCard({ t, low }: { t: Testimonial; low?: boolean }) {
  return (
    <figure
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-3xl bg-card p-5 shadow-card sm:w-80 sm:p-6",
        // Every other card sits lower, so the row reads as a loose stack rather than a strip.
        low && "translate-y-4",
      )}
    >
      <Quote aria-hidden className="size-5 text-clay" />
      <blockquote className="mt-3 flex-1 text-body-sm sm:text-body">{t.quote}</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-full bg-secondary font-display font-semibold text-primary"
        >
          {t.name.charAt(0)}
        </span>
        <span>
          <span className="block text-body-sm font-semibold">{t.name}</span>
          <span className="block text-caption text-muted-foreground">{t.where}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/*
 * Two rows of reviews drifting in opposite directions (Magic UI Marquee), pausing on hover and
 * standing still for reduced motion. The moving rows repeat the cards, so they're hidden from
 * screen readers and a plain list carries the reviews instead.
 */
export function Testimonials() {
  const reversed = [...testimonials].reverse();

  return (
    <Section className="overflow-hidden">
      <SectionIntro
        title="What customers say"
        intro="Households, students and workers across Chuka."
      />

      <ul className="sr-only">
        {testimonials.map((t) => (
          <li key={t.name}>
            {t.quote} — {t.name}, {t.where}
          </li>
        ))}
      </ul>

      <div
        aria-hidden
        className="-mx-gutter mt-8 flex flex-col gap-2 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:mt-12"
      >
        <Marquee pauseOnHover repeat={4} className="py-4 [--duration:55s] [--gap:1rem]">
          {testimonials.map((t, i) => (
            <ReviewCard key={t.name} t={t} low={i % 2 === 1} />
          ))}
        </Marquee>
        <Marquee pauseOnHover reverse repeat={4} className="py-4 [--duration:65s] [--gap:1rem]">
          {reversed.map((t, i) => (
            <ReviewCard key={t.name} t={t} low={i % 2 === 0} />
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
