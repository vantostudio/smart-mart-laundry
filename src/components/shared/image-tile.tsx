import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  image: string;
  title: string;
  caption?: string;
  href?: Route;
  aspect?: "3/4" | "4/5";
  sizes?: string;
  className?: string;
};

/** Photo with a green scrim and caption: market aisles, the "day at Street Mart" tour. */
export function ImageTile({
  image,
  title,
  caption,
  href,
  aspect = "4/5",
  sizes = "(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw",
  className,
}: Props) {
  const tile = (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-2xl shadow-card ring-1 ring-foreground/5",
        aspect === "3/4" ? "aspect-3/4" : "aspect-4/5",
        !href && className,
      )}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-scrim" />
      {href && (
        <span
          aria-hidden
          className="absolute top-3 right-3 flex size-9 translate-y-1 items-center justify-center rounded-full bg-on-media/90 text-primary opacity-0 shadow-card backdrop-blur transition duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="size-4" />
        </span>
      )}
      <figcaption className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-display text-subtitle font-semibold text-on-media">{title}</p>
        {caption && <p className="mt-0.5 text-caption text-on-media/80">{caption}</p>}
      </figcaption>
    </figure>
  );

  return href ? (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl transition-transform duration-300 ease-out-expo hover:-translate-y-1",
        className,
      )}
    >
      {tile}
    </Link>
  ) : (
    tile
  );
}
