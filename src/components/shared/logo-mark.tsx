import { cn } from "@/lib/utils";

/**
 * Street Mart mark: a clothes hanger whose hook curls into an "S", for laundry and clothes in one
 * shape. Drawn in `currentColor`, so it follows the text colour of the surface it sits on.
 * The same paths are used in src/app/icon.svg and src/app/apple-icon.tsx.
 */
export const LOGO_PATHS = {
  hook: "M38.5 16 A6.5 6.5 0 1 0 32 22.5 A6.5 6.5 0 0 1 32 35.5 V39",
  hanger: "M32 39 L10 55 H54 Z",
} as const;

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <path d={LOGO_PATHS.hook} />
      <path d={LOGO_PATHS.hanger} />
    </svg>
  );
}
