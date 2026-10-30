import { ArrowRight, Check, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { homeImages } from "@/features/home/data";
import { unsplash } from "@/lib/images";

import { OrderUpdates } from "./order-updates";

const promises = ["Free pickup & delivery", "Free ironing", "Pay on delivery"];

/*
 * Phones and tablets: copy → booking button → photo with live order updates over it.
 * lg: copy and button on the left, a tall photo on the right with the updates hanging off its edge.
 */
export function Hero() {
  const { hero } = homeImages;

  return (
    <section className="relative overflow-hidden bg-glow">
      <div className="container-page grid items-center gap-10 pt-8 pb-16 sm:gap-12 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-16 lg:pb-24">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-caption font-medium shadow-card">
            <span aria-hidden className="size-1.5 rounded-full bg-clay" />
            Free pickup anywhere in Chuka
          </p>
          <h1 className="mt-5 display text-display-xl">
            Laundry day, <span className="text-clay">handled.</span>
          </h1>
          <p className="mt-4 max-w-md text-body-lg text-muted-foreground sm:mt-5">
            We collect from your gate, wash, dry and iron, and bring everything back before your
            deadline.
          </p>
          {/* Both halves of the business up front: laundry first, the shop right beside it. */}
          <div className="mt-7 flex flex-col gap-3 xs:flex-row sm:mt-8">
            <Button asChild variant="gradient-clay" size="xl" className="rounded-full">
              <Link href="/laundry" data-hero-cta>
                Book a pickup <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="rounded-full">
              <Link href="/shop">
                <Shirt aria-hidden /> Shop clothes
              </Link>
            </Button>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-body-sm text-muted-foreground">
            {promises.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-4 text-clay" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="relative aspect-4/3 overflow-hidden rounded-4xl sm:aspect-16/10 lg:aspect-4/5">
            <Image
              src={unsplash(hero.id, 1200)}
              alt={hero.alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              // Keep the drums in frame on the wide phone/tablet crop
              className="object-cover object-[center_20%]"
            />
          </div>
          <OrderUpdates className="absolute bottom-3 left-3 w-[min(18rem,calc(100%-1.5rem))] sm:bottom-6 sm:left-6 lg:bottom-10 lg:-left-10" />
        </div>
      </div>
    </section>
  );
}
