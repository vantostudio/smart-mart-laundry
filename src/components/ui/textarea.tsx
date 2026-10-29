import type * as React from "react";

import { cn } from "@/lib/utils";

import { fieldVariants, type FieldVariantProps } from "./field-styles";

function Textarea({
  className,
  tone,
  ...props
}: React.ComponentProps<"textarea"> & Omit<FieldVariantProps, "shape">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldVariants({ tone }), "min-h-22 resize-y px-3.5 py-2.5", className)}
      {...props}
    />
  );
}

export { Textarea };
