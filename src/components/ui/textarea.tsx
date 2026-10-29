import type * as React from "react";

import { cn } from "@/lib/utils";

import { fieldVariants } from "./field-styles";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldVariants(), "min-h-22 resize-y px-3.5 py-2.5", className)}
      {...props}
    />
  );
}

export { Textarea };
