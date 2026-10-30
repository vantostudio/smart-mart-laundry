import { ArrowRight, Check, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DeliveryLocationIllustration } from "@/components/illustrations/delivery-location";
import { MobilePaymentsIllustration } from "@/components/illustrations/mobile-payments";
import { TextMessagesIllustration } from "@/components/illustrations/text-messages";
import { MediaCard } from "@/components/shared/media-card";
import { Price } from "@/components/shared/price";
import { Section } from "@/components/shared/section";
import { StaggerGrid } from "@/components/shared/stagger-grid";
import { Button } from "@/components/ui/button";
import { homeImages } from "@/features/home/data";
import { basketFrom } from "@/features/laundry/data";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

import { SectionIntro } from "./section-intro";

const channels = [
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: MessageSquareText, label: "SMS" },
  { icon: Phone, label: "Call" },
];

const illustration = "h-[78%] w-auto max-w-[85%]";

// How booking works, in the words of the laundry page.
const steps = ["Tap what needs washing", "Pick your days", "Send it on WhatsApp"];

function Perk({ children }: { children: string }) {
  return (
    <p className="flex items-start gap-1.5 text-caption font-semibold">
      <Check aria-hidden className="mt-px size-3.5 shrink-0 text-clay" /> {children}
    </p>
  );
}
const photo = (key: keyof typeof homeImages) => (
  <Image
    src={unsplash(homeImages[key].id, 700)}
    alt={homeImages[key].alt}
    fill
    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 128px"
    className="object-cover"
  />
);

/*
 * Six things customers get, as a staggered grid: horizontal cards that mirror one after another
 * on phones, two columns with the right one dropped on tablets, three with the middle one dropped
 * on desktop, then the three booking steps and a button. Photos for real results, illustrations
 * for the service around them.
 */
export function WhyStreetMart() {
  return (
    <Section id="services">
      <SectionIntro
        title="Everything taken care of"
        intro="Book in two minutes, no account needed. From your gate and back again: we collect, clean, iron and return your laundry, and keep you posted the whole way."
      />

      <StaggerGrid className="mt-10 sm:mt-12 lg:mt-16">
        <MediaCard
          key="pickup"
          visual={<DeliveryLocationIllustration className={illustration} />}
          title="Free pickup & delivery"
          footer={<Perk>Free on every order</Perk>}
        >
          <p>From your gate, hostel or office, anywhere in Chuka.</p>
        </MediaCard>

        <MediaCard
          key="notify"
          tone="accent"
          visual={<TextMessagesIllustration className={illustration} />}
          title="We tell you when it's ready"
        >
          <p>On WhatsApp when it's on the way. Rather an SMS or a call? Just say so in the chat.</p>
          <ul aria-label="Ways we can reach you" className="mt-3 flex flex-wrap gap-1.5">
            {channels.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-caption font-semibold text-foreground"
              >
                <Icon aria-hidden className="size-3.5 text-clay" /> {label}
              </li>
            ))}
          </ul>
        </MediaCard>

        <MediaCard
          key="ironing"
          visual={photo("folded")}
          title="Ironing included"
          footer={<Perk>Every item, no extra cost</Perk>}
        >
          <p>Every item pressed and folded before it comes back.</p>
        </MediaCard>

        <MediaCard
          key="pay"
          visual={<MobilePaymentsIllustration className={illustration} />}
          title="Pay when it's back"
          footer={
            <Link href="/laundry#prices" className="inline-flex min-h-11 items-center text-link">
              See all prices
            </Link>
          }
        >
          <p>
            Cash or M-Pesa on delivery. Baskets from{" "}
            <Price amount={basketFrom} size="sm" className="text-foreground" />.
          </p>
        </MediaCard>

        <MediaCard
          key="duvets"
          visual={photo("laundryRoom")}
          title="Duvets, mats & shoes"
          footer={<Perk>Priced per item</Perk>}
        >
          <p>Duvets, mats and shoes too, not just clothes.</p>
        </MediaCard>

        <MediaCard
          key="turnaround"
          visual={
            <ol aria-hidden className="grid w-[82%] gap-1 sm:gap-2">
              {["Same day", "Next day", "Your pick"].map((label, i) => (
                <li
                  key={label}
                  className={cn(
                    "flex items-center justify-between rounded-full px-2.5 py-1 text-caption font-semibold xs:px-3 sm:py-2",
                    i === 1 ? "bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {label}
                  <span className="hidden size-1.5 rounded-full bg-clay xs:block" />
                </li>
              ))}
            </ol>
          }
          title="Back when you need it"
          footer={<Perk>You choose when booking</Perk>}
        >
          <p>
            Same day, next day or any day that week. Morning collections can be back by evening.
          </p>
        </MediaCard>
      </StaggerGrid>

      {/* How booking works, folded in from the old "how it works" section. */}
      <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-secondary/70 p-4 sm:mt-10 sm:p-5 lg:flex-row lg:items-center lg:gap-6 lg:p-6">
        <ol aria-label="How booking works" className="grid flex-1 gap-2 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 shadow-card"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-body-sm font-bold text-primary-foreground figures">
                {i + 1}
              </span>
              <span className="text-body-sm font-semibold">{step}</span>
            </li>
          ))}
        </ol>
        <Button asChild variant="gradient-clay" size="lg" className="shrink-0 rounded-full">
          <Link href="/laundry">
            Book a pickup <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
