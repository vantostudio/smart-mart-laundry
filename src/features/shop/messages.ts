import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { ksh } from "@/lib/format";

/* Every message the public shop shows when something goes wrong or there's nothing to show. */

export type LoadProblem = "offline" | "unavailable" | "busy" | "not-found";

const busy = {
  title: "Just a moment",
  body: "That was a lot of requests. Please wait a moment and try again.",
};

const offline = {
  title: "You're offline",
  body: "Check your connection, then try again.",
};

export const shopMessages = {
  list: {
    offline,
    busy,
    unavailable: {
      title: "We couldn't load the shop just now",
      body: "Please try again in a moment. You can also ask us on WhatsApp what's in stock.",
    },
  },
  more: {
    offline: "You're offline. Check your connection, then try again.",
    busy: "That was a lot of requests. Please wait a moment and try again.",
    unavailable: "We couldn't load more items. Please try again.",
  },
  item: {
    offline,
    busy,
    unavailable: {
      title: "We couldn't load this item",
      body: "Please try again in a moment.",
    },
    "not-found": {
      title: "This item is no longer available",
      body: "It may have just sold. There's plenty more in the shop.",
    },
  },
  /** What the quick view and the product page both show. */
  product: {
    photos: "Photos",
    mtumba: "Mtumba",
    brandNew: "Brand new",
    onePiece: "One piece only. We confirm it's still here when you order.",
    size: "Size",
    chooseSize: "Choose a size",
    chooseSizeFirst: "Choose a size first.",
    quantity: "Quantity",
    addToBag: (amount: number) => `Add to bag · ${ksh(amount)}`,
    alreadyInBag: "Already in your bag",
    added: "Added to your bag",
    keepShopping: "Keep shopping",
    viewBag: "View bag",
    delivery: (freeFrom: number) =>
      `Delivered anywhere in Chuka, free over ${ksh(freeFrom)}. Pay on delivery.`,
    pickup: "Or pick it up and try it on at Chuka General.",
    ask: "Ask about this item",
    askMessage: (p: PublicProduct, size: string | null) =>
      `Hi Street Mart, is the ${p.name} (${p.code})${size ? ` in size ${size}` : ""} still available?`,
  },
  /** The product page `/shop/[code]`: text for search results and social cards. */
  productPage: {
    description: (p: PublicProduct) => {
      const kind = p.condition === "mtumba" ? "Mtumba" : "Brand new";
      const note = p.note ? ` ${p.note.trim()}` : "";
      return `${p.name}: ${kind.toLowerCase()} ${categoryLabels[p.category].toLowerCase()} for ${ksh(p.price)}.${note} Order on WhatsApp for delivery in Chuka, or try it on at Chuka General.`.slice(
        0,
        300,
      );
    },
    missingTitle: "Item no longer available",
    back: "Back to the shop",
  },
  empty: {
    title: "New stock is on its way",
    body: "Nothing's listed right now. Ask us on WhatsApp what's just come in.",
  },
  loadingList: "Loading the shop…",
  loadingItem: "Loading this item…",
  retry: "Try again",
  backToShop: "Back to the shop",
  askWhatsApp: "Ask on WhatsApp",
  askWhatsAppMessage: "Hi Street Mart, what's in stock at the shop right now?",
} as const;
