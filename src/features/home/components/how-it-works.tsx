import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BookedIllustration } from "@/components/illustrations/booked";
import { OnTheWayIllustration } from "@/components/illustrations/on-the-way";
import { OrderDeliveredIllustration } from "@/components/illustrations/order-delivered";
import { MediaCard } from "@/components/shared/media-card";
import { Section } from "@/components/shared/section";
import { StaggerGrid } from "@/components/shared/stagger-grid";
import { Button } from "@/components/ui/button";
import { homeImages, howSteps } from "@/features/home/data";
import { unsplash } from "@/lib/images";

import { SectionIntro } from "./section-intro";

const illustration = "h-[80%] w-auto max-w-[88%]";

// One visual per step: illustrations for the service, a photo for the result.
const visuals: ReactNode[] = [
  <BookedIllustration key="book" className={illustration} />,
  <OnTheWayIllustration key="pickup" className={illustration} />,
  <Image
    key="clean"
    src={unsplash(homeImages.stack.id, 600)}
    alt={homeImages.stack.alt}
    fill
    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 128px"
    className="object-cover"
  />,
  <OrderDeliveredIllustration key="back" className={illustration} />,
];

/*
 * Four steps on a staggered grid: horizontal cards that mirror one after another on phones, two
 * dropped columns on tablets, four alternating up and down on desktop along a dashed route.
 */
export function HowItWorks() {
  return (
    <Section tone="muted">
      <SectionIntro
        title="Laundry doesn't have to be complicated"
        intro="Book once and leave the rest to us. We collect, clean and bring everything back to your door."
      />

      <div className="relative mt-10 sm:mt-12 lg:mt-16">
        <svg
          aria-hidden
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-[38%] hidden h-40 w-full stroke-clay/50 lg:block"
        >
          <path
            d="M0 120 C 150 20, 300 20, 450 110 S 750 200, 900 90 S 1120 30, 1200 70"
            fill="none"
            strokeWidth="2"
            strokeDasharray="6 10"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <StaggerGrid cols={4} aria-label="How it works" className="relative">
          {howSteps.map((step, i) => (
            <MediaCard
              key={step.title}
              visual={visuals[i]}
              eyebrow={`Step ${i + 1}`}
              title={step.title}
              footer={
                <p className="flex items-start gap-1.5 text-caption font-semibold">
                  <Check aria-hidden className="mt-px size-3.5 shrink-0 text-clay" /> {step.perk}
                </p>
              }
            >
              <p>{step.body}</p>
            </MediaCard>
          ))}
        </StaggerGrid>
      </div>

      <div className="mt-6 flex justify-center sm:mt-8">
        <Button asChild variant="primary" size="lg" className="rounded-full">
          <Link href="/laundry">
            Book a pickup <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
