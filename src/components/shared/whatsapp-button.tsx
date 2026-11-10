import type { VariantProps } from "class-variance-authority";
import { MessageCircle } from "lucide-react";
import type * as React from "react";

import { Button, type buttonVariants } from "@/components/ui/button";

import { WhatsAppLink } from "./contact";

type Props = Omit<React.ComponentProps<"a">, "href"> &
  VariantProps<typeof buttonVariants> & {
    /** Pre-filled chat message. */
    message?: string;
  };

/** Button with the chat icon that opens WhatsApp with a pre-filled message, in a new tab. */
export function WhatsAppButton({
  message,
  variant = "clay",
  size,
  block,
  children,
  ...props
}: Props) {
  return (
    <Button asChild variant={variant} size={size} block={block}>
      <WhatsAppLink message={message} {...props}>
        <MessageCircle aria-hidden />
        {children}
      </WhatsAppLink>
    </Button>
  );
}
