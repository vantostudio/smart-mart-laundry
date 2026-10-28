import { site } from "@/config/site";

export function waLink(text: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_ORDER_DEFAULT =
  "Hi Street Mart, I'd like to book a laundry pickup or ask about your services.";
