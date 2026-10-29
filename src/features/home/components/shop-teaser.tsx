import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ImageTile } from "@/components/shared/image-tile";
import { Section } from "@/components/shared/section";
import { StaggerGrid } from "@/components/shared/stagger-grid";
import { Button } from "@/components/ui/button";
import { shopCategories } from "@/features/shop/data";

/** The shop on a dark band: copy on the left, four category photos staggered on the right. */
export function ShopTeaser() {
  return (
    <Section tone="brand">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div className="max-w-md">
          <p className="caps-label text-clay">Also from Street Mart</p>
          <h2 className="mt-3 display text-display">Clothes & shoes, mtumba and new</h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Campus trends, everyday wear and shoes from Chuka General, delivered by our riders.
          </p>
          <Button asChild variant="inverse" size="lg" className="mt-7 rounded-full">
            <Link href="/shop">
              Browse the shop <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <StaggerGrid cols={2} phone="columns" aria-label="Shop categories">
          {shopCategories.slice(0, 4).map((c) => (
            <ImageTile
              key={c.id}
              image={c.image}
              title={c.name}
              caption={c.caption}
              href={`/shop?cat=${c.id}`}
              aspect="4/5"
              sizes="(min-width: 1024px) 26vw, 50vw"
            />
          ))}
        </StaggerGrid>
      </div>
    </Section>
  );
}
