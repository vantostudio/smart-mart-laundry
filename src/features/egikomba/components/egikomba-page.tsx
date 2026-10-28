import { Bike, MessageCircle, Store } from "lucide-react";

import { FeatureCard } from "@/components/shared/feature-card";
import { ImageTile } from "@/components/shared/image-tile";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { egikombaCategories } from "@/features/egikomba/data";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

const CATALOGUE_MESSAGE = "Hi Street Mart, please send me today's E-Gikomba catalogue.";

const buySteps = [
  {
    icon: MessageCircle,
    title: "Browse on WhatsApp",
    body: "Each stall posts its stock with photos and prices — ask for today's catalogue.",
  },
  {
    icon: Store,
    title: "Choose your pick",
    body: "Reserve what you like. Everything is clothes and shoes only, mtumba or brand new.",
  },
  {
    icon: Bike,
    title: "We deliver",
    body: "A Street Mart rider brings your order to your gate. Pay on delivery.",
  },
];

export function EgikombaPage() {
  return (
    <>
      <PageHero
        eyebrow="E-Gikomba"
        title="The marketplace at Chuka General"
        intro="Clothes and shoes only — mtumba and brand new — from trusted sellers around Chuka. Browse on WhatsApp and let Street Mart riders deliver to your door."
        chips={["Mtumba & brand new", "Clothes & shoes only", "Rider delivery"]}
        image={{
          src: unsplash("photo-1720343354398-89c6aa6d12a4", 1000),
          alt: "A woman in a colourful dress from an E-Gikomba stall",
        }}
        actions={
          <WhatsAppButton message={CATALOGUE_MESSAGE} variant="gradient-clay" size="lg">
            Get today&apos;s catalogue
          </WhatsAppButton>
        }
      />

      <Section spacing="bottom">
        <SectionHeading eyebrow="What's in the market" title="Pick your aisle" />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {egikombaCategories.map((c, i) => (
            <ImageTile
              key={c.id}
              image={c.image}
              title={c.name}
              caption={c.caption}
              className={cn(i === 4 && "col-span-2 md:col-span-1")}
            />
          ))}
        </div>
      </Section>

      <Section tone="brand">
        <SectionHeading
          eyebrow="How buying works"
          title="Three steps to your gate"
          intro="No stall-hopping in the sun — the market comes to your phone, and the rider comes to you."
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-3">
          {buySteps.map((s, i) => (
            <li key={s.title} className="flex">
              <FeatureCard
                variant="glass"
                icon={s.icon}
                step={i + 1}
                title={s.title}
                body={s.body}
                className="w-full"
              />
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <WhatsAppButton message={CATALOGUE_MESSAGE} variant="gradient-sunset" size="lg">
            Get today&apos;s catalogue
          </WhatsAppButton>
        </div>
      </Section>
    </>
  );
}
