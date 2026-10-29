import type * as React from "react";

import { cn } from "@/lib/utils";

import { fieldVariants, type FieldVariantProps } from "./field-styles";

function Input({
  className,
  type,
  shape,
  ...props
}: React.ComponentProps<"input"> & FieldVariantProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldVariants({ shape }),
        shape === "pill" ? "h-12 px-5" : "h-11 px-3.5",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
