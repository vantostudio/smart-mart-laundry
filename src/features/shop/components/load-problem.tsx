import { CloudOff } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { shopMessages } from "@/features/shop/messages";

type Props = {
  title: string;
  body: string;
  onRetry: () => void;
  /** A second way forward, such as WhatsApp. */
  children?: ReactNode;
};

/** When the shop can't load something: what happened, Try again, and what else can be done. */
export function LoadProblemNotice({ title, body, onRetry, children }: Props) {
  return (
    <div
      role="alert"
      className="mt-6 grid justify-items-center gap-3 rounded-3xl bg-card px-5 py-12 text-center shadow-card"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <CloudOff aria-hidden className="size-6" />
      </span>
      <p className="display text-title">{title}</p>
      <p className="max-w-sm text-body-sm text-muted-foreground">{body}</p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="primary" size="lg" onClick={onRetry}>
          {shopMessages.retry}
        </Button>
        {children}
      </div>
    </div>
  );
}
