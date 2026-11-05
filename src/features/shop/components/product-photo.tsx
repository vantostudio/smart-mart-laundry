import { Shirt } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  /** Null when staff haven't added a photo. */
  src: string | null | undefined;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** A product's photo filling its frame, or a plain tile when there isn't one. */
export function ProductPhoto({ src, alt = "", sizes, priority, className }: Props) {
  if (!src) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground"
      >
        <Shirt aria-hidden className="size-1/4 max-h-12 min-h-5 max-w-12 min-w-5" />
      </span>
    );
  }
  // Photos are already resized when they're uploaded, so they skip the image loader.
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}
