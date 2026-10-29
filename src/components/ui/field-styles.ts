import { cva, type VariantProps } from "class-variance-authority";

/** Shared look for Input, Textarea and NativeSelect. */
export const fieldVariants = cva(
  [
    "w-full min-w-0 border text-base text-foreground transition-[border-color,box-shadow,background-color] duration-200 outline-none",
    "placeholder:text-muted-foreground/75",
    "focus-visible:border-clay focus-visible:ring-4 focus-visible:ring-clay/20",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
  ],
  {
    variants: {
      tone: {
        default: "border-input bg-card hover:border-foreground/25",
        // On bottle-green panels (cart): translucent field, cream text.
        inverse:
          "border-primary-foreground/25 bg-primary-foreground/8 text-primary-foreground placeholder:text-primary-foreground/55 hover:border-primary-foreground/50 [&_option]:bg-primary [&_option]:text-primary-foreground",
      },
      shape: {
        rounded: "rounded-xl",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      tone: "default",
      shape: "rounded",
    },
  },
);

export type FieldVariantProps = VariantProps<typeof fieldVariants>;
