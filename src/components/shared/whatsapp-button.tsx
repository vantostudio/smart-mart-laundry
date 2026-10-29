import type { VariantProps } from "class-variance-authority";
import { MessageCircle } from "lucide-react";
import type * as React from "react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { WHATSAPP_ORDER_DEFAULT, waLink } from "@/lib/whatsapp";

type Props = Omit<React.ComponentProps<"a">, "href"> &
  VariantProps<typeof buttonVariants> & {
    /** Pre-filled chat message. */
    message?: string;
  };

/** Button with the chat icon that opens WhatsApp with a pre-filled message, in a new tab. */
export function WhatsAppButton({
  message = WHATSAPP_ORDER_DEFAULT,
  variant = "clay",
  size,
  block,
  children,
  ...props
}: Props) {
  return (
    <Button asChild variant={variant} size={size} block={block}>
      <a href={waLink(message)} target="_blank" rel="noreferrer" {...props}>
        <MessageCircle aria-hidden />
        {children}
      </a>
    </Button>
  );
}
