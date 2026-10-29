import { cva, type VariantProps } from "class-variance-authority";

/** Shared look for Input, Textarea and NativeSelect. */
export const fieldVariants = cva(
  [
    "w-full min-w-0 border border-input bg-card text-base text-foreground transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-foreground/25",
    "placeholder:text-muted-foreground/75",
    "focus-visible:border-clay focus-visible:ring-4 focus-visible:ring-clay/20",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
  ],
  {
    variants: {
      shape: {
        rounded: "rounded-xl",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "rounded",
    },
  },
);

export type FieldVariantProps = VariantProps<typeof fieldVariants>;
