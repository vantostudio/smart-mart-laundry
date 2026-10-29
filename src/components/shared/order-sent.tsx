"use client";

import { CheckCircle2, Copy, Phone } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { phoneHref, site } from "@/config/site";
import { cn } from "@/lib/utils";

type Props = {
  /** The current order has been opened in WhatsApp. */
  sent: boolean;
  /** The WhatsApp message, for "Copy order". */
  message: string;
  /** Classes for the notice box (spacing). */
  className?: string;
  /** What to do next, under the heading. */
  children: ReactNode;
};

/**
 * "Your order is ready in WhatsApp", what happens next, and a copy or a call in case the app
 * didn't open. Always mounted, so screen readers announce the notice when it appears.
 */
export function OrderSent({ sent, message, className, children }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div aria-live="polite">
      {sent && (
        <div className={cn("rounded-2xl bg-success-soft", className)}>
          <p className="flex items-center gap-2 text-body-sm font-semibold text-success">
            <CheckCircle2 aria-hidden className="size-4 shrink-0" />
            Your order is ready in WhatsApp
          </p>
          {children}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" size="md" onClick={copy}>
              <Copy aria-hidden /> {copied ? "Copied" : "Copy order"}
            </Button>
            <Button asChild variant="secondary" size="md">
              <a href={phoneHref} aria-label={`Call ${site.phoneDisplay}`}>
                <Phone aria-hidden /> Call us
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
