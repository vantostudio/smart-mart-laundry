import Image from "next/image";
import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  chips?: string[];
  image?: { src: string; alt: string };
  actions?: React.ReactNode;
};

/** Top of every inner page: warm glow, big heading, optional chips, actions and photo. */
export function PageHero({ eyebrow, title, intro, chips, image, actions }: Props) {
  return (
    <section className="relative overflow-hidden bg-glow">
      <div
        className={cn(
          "container-page pt-12 pb-14 sm:pt-16 sm:pb-20",
          image && "grid items-center gap-12 lg:grid-cols-2",
        )}
      >
        <div className="max-w-reading animate-fade-up">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 display text-display-lg">{title}</h1>
          <p className="mt-5 text-body-lg text-muted-foreground">{intro}</p>
          {chips && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c}>
                  <Badge variant="chip">{c}</Badge>
                </li>
              ))}
            </ul>
          )}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {image && (
          <div className="relative hidden animate-fade-up [animation-delay:120ms] lg:block">
            <div
              aria-hidden
              className="absolute -right-4 -bottom-4 size-full rotate-2 rounded-3xl bg-gradient-sunset opacity-25"
            />
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl shadow-lift ring-1 ring-foreground/5">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(min-width: 1152px) 552px, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
