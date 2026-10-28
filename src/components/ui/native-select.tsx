import { ChevronDown } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { fieldVariants, type FieldVariantProps } from "./field-styles";

/** Native <select> (best on phones) styled like Input, with our own chevron. */
function NativeSelect({
  className,
  tone,
  ...props
}: React.ComponentProps<"select"> & Omit<FieldVariantProps, "shape">) {
  return (
    <div data-slot="native-select" className={cn("relative", className)}>
      <select
        className={cn(fieldVariants({ tone }), "h-11 cursor-pointer appearance-none pr-9 pl-3.5")}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export { NativeSelect };
