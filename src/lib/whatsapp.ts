/** `phone` is digits only, from the shop settings. */
export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_ORDER_DEFAULT =
  "Hi Street Mart, I'd like to book a laundry pickup or ask about your services.";
