import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

type Props = {
  image: string;
  title: string;
  caption: string;
  href: Route;
  sizes: string;
};

/** Linked photo with a green scrim and caption, e.g. a shop aisle. */
export function ImageTile({ image, title, caption, href, sizes }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-2xl transition-transform duration-300 ease-out-expo hover:-translate-y-1"
    >
      <figure className="group relative aspect-4/5 overflow-hidden rounded-2xl shadow-card ring-1 ring-foreground/5">
        <Image
          src={image}
          alt={title}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-scrim" />
        <span
          aria-hidden
          className="absolute top-3 right-3 flex size-9 translate-y-1 items-center justify-center rounded-full bg-on-media/90 text-primary opacity-0 shadow-card backdrop-blur transition duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="size-4" />
        </span>
        <figcaption className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-subtitle font-semibold text-on-media">{title}</p>
          <p className="mt-0.5 text-caption text-on-media/80">{caption}</p>
        </figcaption>
      </figure>
    </Link>
  );
}
