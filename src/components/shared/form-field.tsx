import type * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

/** Label wrapping its control (so no id wiring is needed), with an optional hint below. */
export function FormField({ label, hint, children, className }: Props) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="grid gap-2">
        {label}
        {children}
      </Label>
      {hint && <p className="text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
}
