import type * as React from "react";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
};

/** Top of an inner page: warm glow, eyebrow, big heading and intro. */
export function PageHero({ eyebrow, title, intro }: Props) {
  return (
    <section className="relative overflow-hidden bg-glow">
      <div className="container-page pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="max-w-reading animate-fade-up">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 display text-display-lg">{title}</h1>
          <p className="mt-5 text-body-lg text-muted-foreground">{intro}</p>
        </div>
      </div>
    </section>
  );
}
